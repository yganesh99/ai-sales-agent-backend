const Campaign = require('../models/campaign.model');

const createCampaign = async (req, res, next) => {
	try {
		const campaign = new Campaign(req.body);
		await campaign.save();
		res.status(201).json(campaign);
	} catch (error) {
		next(error);
	}
};

const getCampaigns = async (req, res, next) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const campaigns = await Campaign.find({ isDeleted: false })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();
		const count = await Campaign.countDocuments({ isDeleted: false });
		res.json({
			campaigns,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		});
	} catch (error) {
		next(error);
	}
};

const getCampaignById = async (req, res, next) => {
	try {
		const campaign = await Campaign.findById(req.params.id);
		if (!campaign || campaign.isDeleted) {
			return res.status(404).json({ message: 'Campaign not found' });
		}
		res.json(campaign);
	} catch (error) {
		next(error);
	}
};

const updateCampaign = async (req, res, next) => {
	try {
		const campaign = await Campaign.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);
		if (!campaign || campaign.isDeleted) {
			return res.status(404).json({ message: 'Campaign not found' });
		}
		res.json(campaign);
	} catch (error) {
		next(error);
	}
};

const deleteCampaign = async (req, res, next) => {
	try {
		const campaign = await Campaign.findByIdAndUpdate(
			req.params.id,
			{ isDeleted: true },
			{ new: true }
		);
		if (!campaign) {
			return res.status(404).json({ message: 'Campaign not found' });
		}
		res.status(204).send();
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createCampaign,
	getCampaigns,
	getCampaignById,
	updateCampaign,
	deleteCampaign,
};
