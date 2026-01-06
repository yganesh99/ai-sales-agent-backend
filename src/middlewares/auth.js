const tokenService = require('../services/token.service');

module.exports =
	(requiredRoles = []) =>
	(req, res, next) => {
		const auth = req.headers.authorization;
		if (!auth || !auth.startsWith('Bearer '))
			return res.status(401).json({ message: 'Unauthorized' });
		const token = auth.split(' ')[1];
		try {
			const payload = tokenService.verifyAccessToken(token);
			req.user = { id: payload.sub, roles: payload.roles || [] };
			if (
				requiredRoles.length &&
				!requiredRoles.some((r) => req.user.roles.includes(r))
			) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			next();
		} catch (err) {
			return res.status(401).json({ message: 'Invalid token' });
		}
	};
