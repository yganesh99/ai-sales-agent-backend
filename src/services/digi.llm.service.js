const OpenAI = require('openai');

class LLMService {
	constructor() {
		let baseURL = process.env.DO_GENAI_BASE_URL;

		this.client = new OpenAI({
			apiKey: process.env.DO_GENAI_API_KEY,
			baseURL: baseURL,
		});
		this.model = process.env.DO_GENAI_MODEL || 'llama-3-8b-instruct';
	}

	async chatCompletion(messages, temperature = 0.7) {
		try {
			const response = await this.client.chat.completions.create({
				model: this.model,
				messages: messages,
				temperature: temperature,
			});
			return (
				response.choices[0].message.content ||
				response.choices[0].message.reasoning_content ||
				''
			);
		} catch (error) {
			console.error('LLM Service Error:', error);
			throw error;
		}
	}

	/**
	 * Stream chat completion - returns an async iterator of content deltas
	 * @param {Array} messages - Array of message objects
	 * @param {number} temperature - Temperature for generation
	 * @returns {AsyncGenerator} Yields content delta strings
	 */
	async *streamChatCompletion(messages, temperature = 0.7) {
		try {
			const stream = await this.client.chat.completions.create({
				model: this.model,
				messages: messages,
				temperature: temperature,
				stream: true,
			});

			for await (const chunk of stream) {
				const delta = chunk.choices[0]?.delta?.content;
				if (delta) {
					yield delta;
				}
			}
		} catch (error) {
			console.error('LLM Stream Error:', error);
			throw error;
		}
	}
}

module.exports = new LLMService();
