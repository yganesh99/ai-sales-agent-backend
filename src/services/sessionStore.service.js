/**
 * In-memory session store for campaign state management.
 * Each session maintains a CampaignState object that persists across requests.
 */

const CAMPAIGN_FIELDS = [
	'valueProp',
	'painPoints',
	'cta',
	'constraints',
	'communicationTone',
];

const createInitialState = () => ({
	valueProp: null,
	painPoints: null,
	cta: null,
	constraints: null,
	communicationTone: null,
});

class SessionStoreService {
	constructor() {
		this.sessions = new Map();
	}

	/**
	 * Get session state, creating initial state if session doesn't exist
	 * @param {string} sessionId
	 * @returns {Object} CampaignState
	 */
	getSession(sessionId) {
		if (!this.sessions.has(sessionId)) {
			this.sessions.set(sessionId, createInitialState());
		}
		return this.sessions.get(sessionId);
	}

	/**
	 * Update session with partial data (merge)
	 * @param {string} sessionId
	 * @param {Object} partialData - Partial CampaignState fields to update
	 * @returns {Object} Updated CampaignState
	 */
	updateSession(sessionId, partialData) {
		const currentState = this.getSession(sessionId);

		// Only update fields that are in the schema and have non-null values
		for (const field of CAMPAIGN_FIELDS) {
			if (
				partialData[field] !== undefined &&
				partialData[field] !== null
			) {
				currentState[field] = partialData[field];
			}
		}

		this.sessions.set(sessionId, currentState);
		return currentState;
	}

	/**
	 * Check if all campaign fields are filled
	 * @param {string} sessionId
	 * @returns {boolean}
	 */
	isComplete(sessionId) {
		const state = this.getSession(sessionId);
		return CAMPAIGN_FIELDS.every(
			(field) => state[field] !== null && state[field] !== undefined,
		);
	}

	/**
	 * Get list of fields that are still null
	 * @param {string} sessionId
	 * @returns {string[]}
	 */
	getMissingFields(sessionId) {
		const state = this.getSession(sessionId);
		return CAMPAIGN_FIELDS.filter(
			(field) => state[field] === null || state[field] === undefined,
		);
	}

	/**
	 * Delete a session (cleanup)
	 * @param {string} sessionId
	 */
	deleteSession(sessionId) {
		this.sessions.delete(sessionId);
	}

	/**
	 * Clear all sessions (for testing)
	 */
	clearAll() {
		this.sessions.clear();
	}
}

module.exports = new SessionStoreService();
module.exports.CAMPAIGN_FIELDS = CAMPAIGN_FIELDS;
