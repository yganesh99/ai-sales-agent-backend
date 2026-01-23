# Campaign Chat Frontend Integration Guide

This guide details how to integrate the `/api/campaigns/chat` endpoint into a frontend application.

## Core Concept: Stateless API

The `/campaign-chat` endpoint is **stateless**. This means the server **does not** remember previous messages in the conversation.

**The Frontend is responsible for maintaining the entire conversation history (State) and sending it to the backend with every new request.**

## API Contract

### Endpoint

`POST /api/campaigns/chat`

### Request Format

The body must contain a `messages` array. Each message object has a `role` ('user' or 'assistant') and `content`.

```json
{
	"messages": [
		{ "role": "user", "content": "I want to sell coffee." },
		{ "role": "assistant", "content": "What is your value proposition?" },
		{ "role": "user", "content": "It is organic and fair trade." }
	]
}
```

### Response Format

The API returns one of two statuses:

#### 1. In Progress (`status: "in_progress"`)

The LLM needs more information. Display the `message` to the user and allow them to reply.

```json
{
	"status": "in_progress",
	"message": "That's great. What are the main pain points your coffee solves?"
}
```

#### 2. Complete (`status: "complete"`)

The LLM has gathered all necessary information. The `data` object allows you to proceed to the next step (e.g., pre-filling a form or creating the campaign directly).

```json
{
	"status": "complete",
	"data": {
		"value_proposition": "Organic, fair-trade coffee.",
		"target_pain_points": [
			"Chemicals in mass market coffee",
			"Unethical sourcing"
		],
		"call_to_action": "Buy Now",
		"constraints": "USA Only"
	}
}
```

## Integration Logic (Pseudo-Code)

Here is the recommended logic for your frontend component (e.g., React, Vue, Angular):

1.  **Initialize State**:

    ```javascript
    let chatHistory = []; // Stores {role, content} objects
    let isComplete = false;
    ```

2.  **On User Send**:
    ```javascript
    async function sendMessage(userText) {
    	// 1. Add user message to local state
    	const userMsg = { role: 'user', content: userText };
    	chatHistory.push(userMsg);

    	// 2. Call API with ENTIRE history
    	const response = await fetch('/api/campaigns/chat', {
    		method: 'POST',
    		headers: { 'Content-Type': 'application/json' },
    		body: JSON.stringify({ messages: chatHistory }),
    	});

    	const result = await response.json();

    	if (result.status === 'in_progress') {
    		// 3a. Add assistant question to local state so it's included next time
    		const assistantMsg = { role: 'assistant', content: result.message };
    		chatHistory.push(assistantMsg);

    		// Update UI to show the question
    		renderChat(chatHistory);
    	} else if (result.status === 'complete') {
    		// 3b. Task Finished!
    		// Do NOT append this to chat history (it's structured data, not a chat message)

    		// Use result.data to populate your Campaign Creation Form
    		populateForm(result.data);

    		// Disable chat input or redirect user
    		isComplete = true;
    	}
    }
    ```

## Error Handling

-   **Network Errors**: Handle standard HTTP errors (500, 400).
-   **JSON Parsing**: If the LLM fails to return valid JSON (rare), the backend tries to return the raw string as an "in_progress" message. Ensure your UI can handle this gracefully.
