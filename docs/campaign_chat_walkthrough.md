# Walkthrough - Campaign Chat Endpoint

I have implemented the `/campaign-chat` endpoint which uses DigitalOcean Serverless Inference (via OpenAI SDK) to orchestrate a campaign creation workflow.

## Changes

### 1. New Endpoint: `POST /api/campaigns/chat`

This endpoint accepts a list of messages and returns a response from the LLM. It uses a system prompt to guide the conversation towards gathering specific campaign requirements.

**Request Body:**

```json
{
	"messages": [
		{
			"role": "user",
			"content": "I want to start a campaign for selling organic coffee."
		}
	]
}
```

**Response (In Progress):**

```json
{
	"status": "in_progress",
	"message": "That sounds great! What is the unique value proposition of your organic coffee? e.g., Is it fair trade, single-origin, or specifically roasted?"
}
```

**Response (Complete):**

```json
{
	"status": "complete",
	"data": {
		"value_proposition": "Single-origin, fair-trade organic coffee focused on sustainability.",
		"target_pain_points": [
			"Lack of transparent sourcing",
			"Bitter taste in common brands"
		],
		"call_to_action": "Buy Now for 20% off",
		"constraints": "US Shipping only"
	}
}
```

### 2. Configuration

You need to add the following to your `.env` file:

```bash
# DigitalOcean GenAI
DO_GENAI_API_KEY=your_key_here
DO_GENAI_BASE_URL=your_base_url_here
DO_GENAI_MODEL=llama-3-70b-instruct # or your preferred model
```

### 3. File Structure

-   `src/services/llm.service.js`: Wrapper for DO GenAI.
-   `src/controllers/campaignChat.controller.js`: Logic and System Prompt.
-   `src/routes/campaign.routes.js`: Route definition.

## Verification

To verify, start the server (`npm run dev`) and use Postman or curl to send requests to `http://localhost:PORT/api/campaigns/chat` with the required API keys set.
