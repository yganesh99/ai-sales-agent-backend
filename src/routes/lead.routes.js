const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const leadController = require('../controllers/lead.controller');

const router = express.Router();

const leadSchema = {
	lead_type: Joi.string().valid('hot', 'warm', 'cold').required(),
	campaignId: Joi.string().required(),
	source: Joi.string()
		.valid('ai_generated', 'web_form', 'whatsapp', 'manual')
		.required(),
	name: Joi.string().required(),
	email: Joi.string().email().required(),
	phone: Joi.string().required(),
	score: Joi.number().required(),
	intent: Joi.string().valid('low', 'medium', 'high').required(),
	urgency: Joi.string().valid('low', 'medium', 'high').required(),
	summary: Joi.string().required(),
	createdBy: Joi.string().required(),
	lastUpdatedBy: Joi.string().required(),
};

router.post(
	'/',
	celebrate({
		[Segments.BODY]: Joi.object().keys(leadSchema),
	}),
	leadController.createLead
);

router.get('/', leadController.getLeads);

router.get(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(), // In a real app validate ObjectId
		}),
	}),
	leadController.getLeadById
);

router.put(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
		[Segments.BODY]: Joi.object()
			.keys({
				lead_type: Joi.string().valid('hot', 'warm', 'cold'),
				campaignId: Joi.string(),
				source: Joi.string().valid(
					'ai_generated',
					'web_form',
					'whatsapp',
					'manual'
				),
				name: Joi.string(),
				email: Joi.string().email(),
				phone: Joi.string(),
				score: Joi.number(),
				intent: Joi.string().valid('low', 'medium', 'high'),
				urgency: Joi.string().valid('low', 'medium', 'high'),
				summary: Joi.string(),
				createdBy: Joi.string(),
				lastUpdatedBy: Joi.string(),
			})
			.min(1),
	}),
	leadController.updateLead
);

router.delete(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
	}),
	leadController.deleteLead
);

module.exports = router;
