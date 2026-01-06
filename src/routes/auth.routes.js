const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const controller = require('../controllers/authController');
const passport = require('passport');

const router = express.Router();

router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', { session: false }),
	controller.googleCallback
);

router.post(
	'/register',
	celebrate({
		[Segments.BODY]: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().min(8).required(),
			name: Joi.string().optional(),
		}),
	}),
	controller.register
);

router.post(
	'/login',
	celebrate({
		[Segments.BODY]: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
		}),
	}),
	controller.login
);

router.post(
	'/refresh',
	celebrate({
		[Segments.BODY]: Joi.object({ refreshToken: Joi.string().required() }),
	}),
	controller.refresh
);

module.exports = router;
