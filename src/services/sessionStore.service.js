/**
 * In-memory session store for campaign state management.
 * Each session maintains a CampaignState object that persists in Redis across requests.
 */

const CAMPAIGN_FIELDS = [
	'valueProp',
	'painPoints',
	'cta',
	'constraints',
	'communicationTone',
	'audience',
	'background',
	'offer',
	'examples',
	'description',
	'companySize',
	'industry',
	'targetRoles',
	'anythingElse',
];

const createInitialState = () => ({
	valueProp: null,
	painPoints: null,
	cta: null,
	constraints: null,
	communicationTone: null,
	audience: null,
	background: null,
	offer: null,
	examples: null,
	description: null,
	companySize: null,
	industry: null,
	targetRoles: null,
	anythingElse: null,
});

const Redis = require('ioredis');

class SessionStoreService {
	constructor() {
		this.redis = new Redis(process.env.REDIS_HOST);
		this.ttl = 60 * 60; // 60 minutes in seconds
	}

	/**
	 * Get session state, creating initial state if session doesn't exist
	 * @param {string} sessionId
	 * @returns {Promise<Object>} CampaignState
	 */
	async getSession(sessionId) {
		const data = await this.redis.get(`session:${sessionId}`);
		if (data) {
			return JSON.parse(data);
		}
		const initialState = createInitialState();
		await this.redis.set(
			`session:${sessionId}`,
			JSON.stringify(initialState),
			'EX',
			this.ttl,
		);
		return initialState;
	}

	/**
	 * Update session with partial data (merge)
	 * @param {string} sessionId
	 * @param {Object} partialData - Partial CampaignState fields to update
	 * @returns {Promise<Object>} Updated CampaignState
	 */
	async updateSession(sessionId, partialData) {
		const currentState = await this.getSession(sessionId);

		// Only update fields that are in the schema and have non-null values
		for (const field of CAMPAIGN_FIELDS) {
			if (
				partialData[field] !== undefined &&
				partialData[field] !== null
			) {
				currentState[field] = partialData[field];
			}
		}

		await this.redis.set(
			`session:${sessionId}`,
			JSON.stringify(currentState),
			'EX',
			this.ttl,
		);
		return currentState;
	}

	/**
	 * Check if all campaign fields are filled
	 * @param {string} sessionId
	 * @returns {Promise<boolean>}
	 */
	async isComplete(sessionId) {
		const state = await this.getSession(sessionId);
		return CAMPAIGN_FIELDS.every(
			(field) => state[field] !== null && state[field] !== undefined,
		);
	}

	/**
	 * Get list of fields that are still null
	 * @param {string} sessionId
	 * @returns {Promise<string[]>}
	 */
	async getMissingFields(sessionId) {
		const state = await this.getSession(sessionId);
		return CAMPAIGN_FIELDS.filter(
			(field) => state[field] === null || state[field] === undefined,
		);
	}

	/**
	 * Delete a session (cleanup)
	 * @param {string} sessionId
	 * @returns {Promise<void>}
	 */
	async deleteSession(sessionId) {
		await this.redis.del(`session:${sessionId}`);
	}

	/**
	 * Clear all sessions (for testing)
	 */
	async clearAll() {
		const keys = await this.redis.keys('session:*');
		if (keys.length > 0) {
			await this.redis.del(keys);
		}
	}
}

module.exports = new SessionStoreService();
module.exports.CAMPAIGN_FIELDS = CAMPAIGN_FIELDS;
