const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
	{
		lead_type: {
			type: String,
			enum: ['hot', 'warm', 'cold'],
			required: true,
		},
		campaignId: {
			type: String,
			required: true,
		},
		source: {
			type: String,
			enum: ['ai_generated', 'web_form', 'whatsapp', 'manual'],
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		score: {
			type: Number,
			required: true,
		},
		intent: {
			type: String,
			enum: ['low', 'medium', 'high'],
			required: true,
		},
		urgency: {
			type: String,
			enum: ['low', 'medium', 'high'],
			required: true,
		},
		summary: {
			type: String,
			required: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: String,
			required: true,
		},
		lastUpdatedBy: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true, // handles createdAt automatically
	}
);

// Map updatedAt to lastUpdatedAt for API consistency if needed,
// or just rely on timestamps. The prompt asked for lastUpdatedAt.
// Let's add a virtual or just let timestamps handle it but expose it as lastUpdatedAt
// via toJSON if strict adherence is needed.
// However, the prompt specified a property `lastUpdatedAt`.
// Mongoose timestamps provide `createdAt` and `updatedAt`.
// I will explicitly add lastUpdatedAt to match the requirement exactly along with timestamps.

leadSchema.add({
	lastUpdatedAt: { type: Date, default: Date.now },
});

leadSchema.pre('save', function (next) {
	this.lastUpdatedAt = new Date();
	next();
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
