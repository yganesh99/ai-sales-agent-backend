const { GoogleGenAI } = require('@google/genai');

class LLMService {
	constructor() {
		this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
	}

	async chatCompletion(contents) {
		try {
			console.log(contents);
			const response = await this.ai.models.generateContentStream({
				model: 'gemini-3-flash-preview',
				contents: contents,
			});
			console.log(response);

			return response;
		} catch (error) {
			console.error('LLM Service Error:', error);
			throw error;
		}
	}
}

module.exports = new LLMService();
