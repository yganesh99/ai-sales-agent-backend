const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const campaignController = require('../controllers/campaign.controller');
const campaignChatController = require('../controllers/campaignChat.controller');
const { campaignSchema } = require('../schemas/campaign.schema.js');

const router = express.Router();

router.post(
	'/chat',
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			sessionId: Joi.string().required(),
			message: Joi.string().required(),
		}),
	}),
	campaignChatController.handleCampaignChat,
);

router.post('/start-chat', campaignChatController.startChat);

router.post(
	'/',
	celebrate({
		[Segments.BODY]: Joi.object().keys(campaignSchema),
	}),
	campaignController.createCampaign,
);

router.get('/', campaignController.getCampaigns);

router.get(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
	}),
	campaignController.getCampaignById,
);

router.put(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
		[Segments.BODY]: Joi.object()
			.keys({
				title: Joi.string(),
				description: Joi.string(),
				valueProp: Joi.string(),
				painPoints: Joi.string(),
				cta: Joi.string(),
				constraints: Joi.string(),
				communicationTone: Joi.string(),
				audience: Joi.string(),
				background: Joi.string(),
				offer: Joi.string(),
				examples: Joi.string(),
				companySize: Joi.string(),
				industry: Joi.string(),
				targetRoles: Joi.string(),
				anythingElse: Joi.string().allow(''),
				noOfHotLeads: Joi.number(),
				noOfColdLeads: Joi.number(),
				totalLeads: Joi.number(),
				noOfEmailsSent: Joi.number(),
				responsePercentage: Joi.number(),
				createdBy: Joi.string(),
				lastUpdatedBy: Joi.string(),
			})
			.min(1),
	}),
	campaignController.updateCampaign,
);

router.delete(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
	}),
	campaignController.deleteCampaign,
);

module.exports = router;
