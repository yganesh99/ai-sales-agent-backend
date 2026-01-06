const User = require('../models/user.model');
const tokenService = require('../services/token.service');

exports.register = async (req, res, next) => {
	try {
		const { email, password, name } = req.body;
		const existing = await User.findOne({ email });
		if (existing)
			return res.status(409).json({ message: 'Email already in use' });
		const user = new User({ email, password, name });
		await user.save();
		res.status(201).json({ id: user._id, email: user.email });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select('+password');
		if (!user)
			return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await user.comparePassword(password);
		if (!ok)
			return res.status(401).json({ message: 'Invalid credentials' });

		const accessToken = tokenService.signAccessToken({
			sub: user._id,
			roles: user.roles,
		});
		const refreshToken = tokenService.signRefreshToken({ sub: user._id });

		// In production, consider storing refresh tokens (rotating) and set HttpOnly cookie
		res.json({ accessToken, refreshToken });
	} catch (err) {
		next(err);
	}
};

exports.refresh = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken)
			return res.status(400).send({ message: 'Missing token' });
		const payload = tokenService.verifyRefreshToken(refreshToken);
		const accessToken = tokenService.signAccessToken({ sub: payload.sub });
		res.json({ accessToken });
	} catch (err) {
		next(err);
	}
};
