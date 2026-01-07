const Lead = require('../models/lead.model');

const createLead = async (req, res, next) => {
	try {
		// createdBy should probably come from the authenticated user,
		// but for now I'll assume it's passed in the body or handle it here if auth is set up.
		// The prompt lists it as a property. I'll read from body.
		const lead = new Lead(req.body);
		await lead.save();
		res.status(201).json(lead);
	} catch (error) {
		next(error);
	}
};

const getLeads = async (req, res, next) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const leads = await Lead.find({ isDeleted: false })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();
		const count = await Lead.countDocuments({ isDeleted: false });
		res.json({
			leads,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		});
	} catch (error) {
		next(error);
	}
};

const getLeadById = async (req, res, next) => {
	try {
		const lead = await Lead.findById(req.params.id);
		if (!lead || lead.isDeleted) {
			return res.status(404).json({ message: 'Lead not found' });
		}
		res.json(lead);
	} catch (error) {
		next(error);
	}
};

const updateLead = async (req, res, next) => {
	try {
		const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!lead || lead.isDeleted) {
			return res.status(404).json({ message: 'Lead not found' });
		}
		res.json(lead);
	} catch (error) {
		next(error);
	}
};

const deleteLead = async (req, res, next) => {
	try {
		const lead = await Lead.findByIdAndUpdate(
			req.params.id,
			{ isDeleted: true },
			{ new: true }
		);
		if (!lead) {
			return res.status(404).json({ message: 'Lead not found' });
		}
		res.status(204).send();
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createLead,
	getLeads,
	getLeadById,
	updateLead,
	deleteLead,
};
