const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const campaignController = require('../controllers/campaign.controller');

const router = express.Router();

const campaignSchema = {
	title: Joi.string().required(),
	description: Joi.string().required(),
	valueProp: Joi.string().required(),
	painPoints: Joi.string().required(),
	cta: Joi.string().required(),
	constraints: Joi.string().required(),
	createdBy: Joi.string().required(),
	lastUpdatedBy: Joi.string().required(),
};

router.post(
	'/',
	celebrate({
		[Segments.BODY]: Joi.object().keys(campaignSchema),
	}),
	campaignController.createCampaign
);

router.get('/', campaignController.getCampaigns);

router.get(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
	}),
	campaignController.getCampaignById
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
				createdBy: Joi.string(),
				lastUpdatedBy: Joi.string(),
			})
			.min(1),
	}),
	campaignController.updateCampaign
);

router.delete(
	'/:id',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			id: Joi.string().required(),
		}),
	}),
	campaignController.deleteCampaign
);

module.exports = router;
