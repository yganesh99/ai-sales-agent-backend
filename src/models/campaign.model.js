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
		communicationTone: {
			type: String,
			required: true,
		},
		audience: {
			type: String,
			required: true,
		},
		background: {
			type: String,
			required: true,
		},
		offer: {
			type: String,
			required: true,
		},
		examples: {
			type: String,
			required: true, // Assuming required as per others
		},
		companySize: {
			type: String,
			required: true,
		},
		industry: {
			type: String,
			required: true,
		},
		targetRoles: {
			type: String,
			required: true,
		},
		anythingElse: {
			type: String,
			required: false, // Usually "anything else" implies optional
		},
		noOfHotLeads: {
			type: Number,
			default: 0,
		},
		noOfColdLeads: {
			type: Number,
			default: 0,
		},
		totalLeads: {
			type: Number,
			default: 0,
		},
		noOfEmailsSent: {
			type: Number,
			default: 0,
		},
		responsePercentage: {
			type: Number,
			default: 0,
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
	},
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
