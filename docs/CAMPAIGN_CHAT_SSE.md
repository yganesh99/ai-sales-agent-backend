# Campaign Chat SSE Endpoint

A streaming Server-Sent Events (SSE) endpoint for building campaigns through conversational AI.

## Endpoint

```
POST /api/campaigns/chat
```

## Request Body

```json
{
	"sessionId": "string", // Unique session identifier (required)
	"message": "string" // User's message (required)
}
```

## Campaign Schema

The endpoint incrementally builds this state across requests:

```typescript
interface CampaignState {
	valueProp: string | null; // Value proposition
	painPoints: string[] | null; // Target pain points
	cta: string | null; // Call-to-action
	constraints: string | null; // Constraints/limitations
	communicationTone: string | null; // Tone of communication
}
```

---

## SSE Event Types

### 1. `text` - Streaming Response

Emitted frequently as the AI generates conversational output.

```json
{"type": "text", "delta": "Hello"}
{"type": "text", "delta": ", how"}
{"type": "text", "delta": " can I help?"}
```

### 2. `state` - Field Extraction

Emitted when campaign fields are extracted with high confidence.

```json
{
	"type": "state",
	"partial_data": {
		"valueProp": "AI-powered collaboration"
	},
	"missing_fields": ["painPoints", "cta", "constraints", "communicationTone"]
}
```

### 3. `complete` - Campaign Ready

Emitted **once** when all 5 fields are captured. Stream closes after.

```json
{
	"type": "complete",
	"message": "Campaign details captured successfully.",
	"data": {
		"valueProp": "AI-powered collaboration",
		"painPoints": ["Email overload", "Scattered documents"],
		"cta": "Start free trial",
		"constraints": "Enterprise only",
		"communicationTone": "professional"
	}
}
```

### 4. `error` - Error Event

Emitted if processing fails.

```json
{ "type": "error", "message": "Error description" }
```

---

## Frontend Integration

### React Example with EventSource

```tsx
import { useState, useCallback, useMemo } from 'react';

interface CampaignState {
	valueProp: string | null;
	painPoints: string[] | null;
	cta: string | null;
	constraints: string | null;
	communicationTone: string | null;
}

export function useCampaignChat(sessionId: string) {
	const [response, setResponse] = useState('');
	const [campaignState, setCampaignState] = useState<CampaignState | null>(
		null,
	);
	const [missingFields, setMissingFields] = useState<string[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const sendMessage = useCallback(
		async (message: string) => {
			setResponse('');
			setIsLoading(true);

			const response = await fetch('/api/campaigns/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId, message }),
			});

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) return;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n\n');

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;

					try {
						const event = JSON.parse(line.slice(6));

						switch (event.type) {
							case 'text':
								setResponse((prev) => prev + event.delta);
								break;
							case 'state':
								setCampaignState((prev) => ({
									...prev,
									...event.partial_data,
								}));
								setMissingFields(event.missing_fields);
								break;
							case 'complete':
								setCampaignState(event.data);
								setMissingFields([]);
								setIsComplete(true);
								break;
							case 'error':
								console.error('SSE Error:', event.message);
								break;
						}
					} catch (e) {
						// Skip malformed lines
					}
				}
			}

			setIsLoading(false);
		},
		[sessionId],
	);

	return {
		response,
		campaignState,
		missingFields,
		isComplete,
		isLoading,
		sendMessage,
	};
}
```

### Usage in Component

```tsx
function CampaignBuilder() {
	const sessionId = useMemo(() => crypto.randomUUID(), []);
	const {
		response,
		campaignState,
		missingFields,
		isComplete,
		isLoading,
		sendMessage,
	} = useCampaignChat(sessionId);
	const [input, setInput] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage(input);
		setInput('');
	};

	return (
		<div>
			<div className='response'>{response}</div>

			{missingFields.length > 0 && (
				<div>Still needed: {missingFields.join(', ')}</div>
			)}

			<form onSubmit={handleSubmit}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					disabled={isLoading || isComplete}
				/>
				<button
					type='submit'
					disabled={isLoading}
				>
					Send
				</button>
			</form>

			{isComplete && (
				<div className='success'>
					Campaign created!
					<pre>{JSON.stringify(campaignState, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}
```

### Vanilla JavaScript Example

```javascript
async function streamCampaignChat(sessionId, message, callbacks) {
	const response = await fetch('/api/campaigns/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ sessionId, message }),
	});

	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const lines = decoder.decode(value).split('\n\n');

		for (const line of lines) {
			if (!line.startsWith('data: ')) continue;

			const event = JSON.parse(line.slice(6));

			if (event.type === 'text') callbacks.onText?.(event.delta);
			if (event.type === 'state')
				callbacks.onState?.(event.partial_data, event.missing_fields);
			if (event.type === 'complete') callbacks.onComplete?.(event.data);
		}
	}
}

// Usage
streamCampaignChat('session-123', 'Create a campaign for my SaaS product', {
	onText: (delta) => console.log('Text:', delta),
	onState: (data, missing) =>
		console.log('State update:', data, 'Missing:', missing),
	onComplete: (campaign) => console.log('Done!', campaign),
});
```

---

## cURL Testing

```bash
curl -X POST http://localhost:3001/api/campaigns/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123", "message": "I want to create a campaign for my coffee subscription"}' \
  --no-buffer
```

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│  /campaigns/chat     │────▶│   LLM Service   │
│  (SSE Client)   │◀────│  (SSE Controller)    │◀────│   (Streaming)   │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Session Store   │
                        │  (In-Memory Map) │
                        └──────────────────┘
```

### Key Files

| File                                     | Description             |
| ---------------------------------------- | ----------------------- |
| `services/sessionStore.service.js`       | In-memory session state |
| `services/digi.llm.service.js`           | LLM with streaming      |
| `controllers/campaignChat.controller.js` | SSE handler             |
| `routes/campaign.routes.js`              | Route + validation      |
| `schemas/campaign.schema.js`             | Joi validation schema   |
