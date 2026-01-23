const llmService = require('../services/digi.llm.service');
const sessionStore = require('../services/sessionStore.service');
const crypto = require('crypto');

const SYSTEM_PROMPT = `You are an expert digital marketing assistant helping a user define a new marketing campaign. 
Your goal is to gather specific information through natural conversation to build a campaign profile.

You need to collect the following 14 pieces of information:
1. **audience**: Who is the target audience?
2. **background**: What is the background or context for this campaign?
3. **offer**: What is the specific offer or proposition?
4. **examples**: Are there any examples or references to follow?
5. **description**: A brief description of the campaign.
6. **companySize**: What is the target company size?
7. **industry**: What industry are we targeting?
8. **targetRoles**: What are the target job titles or roles?
9. **valueProp**: What is the unique value being offered?
10. **painPoints**: What problems does this solve for the audience? (as an array)
11. **cta**: What should the audience do? (call-to-action)
12. **constraints**: Any pricing, geography, timing, or other limitations?
13. **communicationTone**: What tone should the campaign use? (professional, casual, humorous, etc.)
14. **anythingElse**: Any other relevant details or specific instructions?

**Instructions:**
- Engage in natural conversation to extract this information
- Ask clarifying questions when needed (group related questions efficiently, don't ask 14 questions one by one if not necessary, but ensure clarity)
- Be concise and professional
- Do not hallucinate or assume information not provided

**IMPORTANT - Marking extracted information:**
When you have HIGH CONFIDENCE that the user has provided a specific piece of information, mark it in your response using this exact format:

[FIELD:field_name:value]

Examples:
[FIELD:audience:Small business owners in the tech sector]
[FIELD:background:We are launching a new AI feature]
[FIELD:offer:50% off for the first 3 months]
[FIELD:examples:Like the recent Slack campaign]
[FIELD:description:A colder outreach campaign for our new SaaS product]
[FIELD:companySize:10-50 employees]
[FIELD:industry:SaaS, Technology]
[FIELD:targetRoles:CTO, VP of Engineering]
[FIELD:valueProp:Premium coffee subscription delivered fresh weekly]
[FIELD:painPoints:["Lack of time to visit coffee shops", "Inconsistent coffee quality"]]
[FIELD:cta:Start your free trial today]
[FIELD:constraints:US only, minimum 3-month subscription]
[FIELD:communicationTone:casual]
[FIELD:anythingElse:Avoid using buzzwords]

Only emit a FIELD marker when you are certain about the value. Never guess.
After marking a field, continue your conversational response naturally.
`;

/**
 * SSE Event emitters
 */
const sendSSEEvent = (res, eventType, data) => {
	const payload = JSON.stringify({ type: eventType, ...data });
	res.write(`data: ${payload}\n\n`);
};

const sendTextEvent = (res, delta) => {
	sendSSEEvent(res, 'text', { delta });
};

const sendStateEvent = (res, partialData, missingFields) => {
	sendSSEEvent(res, 'state', {
		partial_data: partialData,
		missing_fields: missingFields,
	});
};

const sendCompleteEvent = (res, data) => {
	sendSSEEvent(res, 'complete', {
		message: 'Campaign details captured successfully.',
		data,
	});
};

/**
 * Parse field markers from accumulated text
 * Format: [FIELD:field_name:value]
 * Handles nested brackets for JSON arrays
 */
const parseFieldMarkers = (text) => {
	const fields = {};
	// Match [FIELD:name:value] where value can contain nested brackets (for arrays)
	// Uses a more permissive pattern then validates JSON separately
	const fieldRegex = /\[FIELD:(\w+):(\[.*?\]|[^\]]+)\]/g;
	let match;

	while ((match = fieldRegex.exec(text)) !== null) {
		const [, fieldName, value] = match;
		try {
			// Try parsing as JSON (for arrays like target_pain_points)
			fields[fieldName] = JSON.parse(value);
		} catch {
			// If not JSON, use as string
			fields[fieldName] = value;
		}
	}

	return fields;
};

/**
 * Remove field markers from text for clean display
 */
const cleanFieldMarkers = (text) => {
	return text.replace(/\[FIELD:\w+:.+?\]/g, '').trim();
};

/**
 * Main SSE handler for campaign chat
 */
const handleCampaignChat = async (req, res, next) => {
	const { sessionId, message } = req.body;

	// Set SSE headers
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('X-Accel-Buffering', 'no'); // For nginx
	res.flushHeaders();

	try {
		// Get current session state
		const currentState = await sessionStore.getSession(sessionId);
		const missingFields = await sessionStore.getMissingFields(sessionId);

		// Build context about what we already know
		let contextMessage = '';
		if (missingFields.length < 14) {
			contextMessage = `\n\nCurrent campaign information collected so far:\n${JSON.stringify(currentState, null, 2)}\n\nStill needed: ${missingFields.join(', ')}`;
		}

		// Build conversation
		const conversation = [
			{ role: 'system', content: SYSTEM_PROMPT + contextMessage },
			{ role: 'user', content: message },
		];

		// Stream response with buffering to handle split field markers
		let accumulatedText = '';
		let lastEmittedFields = {};
		let textBuffer = ''; // Buffer for handling split markers

		for await (const delta of llmService.streamChatCompletion(
			conversation,
			0.3,
		)) {
			accumulatedText += delta;
			textBuffer += delta;

			// Process buffer - emit text that's definitely not part of a marker
			// A marker starts with '[FIELD:' and ends with ']'
			while (textBuffer.length > 0) {
				const markerStartIndex = textBuffer.indexOf('[');

				if (markerStartIndex === -1) {
					// No potential marker, emit all buffered text
					if (textBuffer) {
						sendTextEvent(res, textBuffer);
					}
					textBuffer = '';
					break;
				}

				// Check if this could be a field marker start
				const possibleMarker = textBuffer.slice(markerStartIndex);
				const isFieldMarkerStart =
					possibleMarker.startsWith('[FIELD:') ||
					'[FIELD:'.startsWith(possibleMarker.slice(0, 7));

				if (markerStartIndex > 0) {
					// Emit text before the potential marker
					sendTextEvent(res, textBuffer.slice(0, markerStartIndex));
					textBuffer = textBuffer.slice(markerStartIndex);
				}

				if (!isFieldMarkerStart) {
					// Not a field marker, emit the '[' and continue
					sendTextEvent(res, '[');
					textBuffer = textBuffer.slice(1);
					continue;
				}

				// Check if we have a complete field marker
				const markerEndIndex = textBuffer.indexOf(']');
				if (markerEndIndex !== -1) {
					// Complete marker found - skip it (don't emit)
					textBuffer = textBuffer.slice(markerEndIndex + 1);
				} else {
					// Incomplete marker - wait for more data
					break;
				}
			}

			// Check for new field extractions in accumulated text
			const extractedFields = parseFieldMarkers(accumulatedText);
			const newFields = {};

			for (const [key, value] of Object.entries(extractedFields)) {
				if (!(key in lastEmittedFields)) {
					newFields[key] = value;
					lastEmittedFields[key] = value;
				}
			}

			// Emit state event if we found new fields
			if (Object.keys(newFields).length > 0) {
				await sessionStore.updateSession(sessionId, newFields);
				const updatedMissingFields =
					await sessionStore.getMissingFields(sessionId);
				sendStateEvent(res, newFields, updatedMissingFields);
			}
		}

		// Emit any remaining buffered text (that wasn't a complete marker)
		if (textBuffer) {
			// Clean any partial markers from remaining buffer
			const cleanedBuffer = textBuffer.replace(/\[FIELD:[^\]]*$/, '');
			if (cleanedBuffer) {
				sendTextEvent(res, cleanedBuffer);
			}
		}

		// Final check: parse any remaining field markers
		const finalFields = parseFieldMarkers(accumulatedText);
		if (Object.keys(finalFields).length > 0) {
			await sessionStore.updateSession(sessionId, finalFields);
		}

		// Check if campaign is complete
		if (await sessionStore.isComplete(sessionId)) {
			const finalState = await sessionStore.getSession(sessionId);
			sendCompleteEvent(res, finalState);
			await sessionStore.deleteSession(sessionId);
		}

		// Close stream
		res.end();
	} catch (error) {
		console.error('Campaign Chat Error:', error);

		// Send error event before closing
		sendSSEEvent(res, 'error', {
			message: error.message || 'An error occurred during processing',
		});
		res.end();
	}
};

/**
 * Start a new chat session
 */
const startChat = async (req, res) => {
	const sessionId = crypto.randomUUID();
	const chatId = crypto.randomUUID();

	// Initialize session in store
	await sessionStore.getSession(sessionId);

	res.json({
		sessionId,
		chatId,
	});
};

module.exports = {
	handleCampaignChat,
	startChat,
};
