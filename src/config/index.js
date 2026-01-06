const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	port: process.env.PORT || 4000,
	mongoUri: process.env.MONGO_URI,
	env: process.env.NODE_ENV || 'development',
	jwt: {
		accessSecret: process.env.JWT_ACCESS_SECRET,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		accessExp: process.env.ACCESS_TOKEN_EXP || '15m',
		refreshExp: process.env.REFRESH_TOKEN_EXP || '7d',
	},
};
