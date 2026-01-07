const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		valueProp: {
			type: String,
			required: true,
		},
		painPoints: {
			type: String,
			required: true,
		},
		cta: {
			type: String,
			required: true,
		},
		constraints: {
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
		timestamps: true,
	}
);

campaignSchema.add({
	lastUpdatedAt: { type: Date, default: Date.now },
});

campaignSchema.pre('save', function (next) {
	this.lastUpdatedAt = new Date();
	next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
