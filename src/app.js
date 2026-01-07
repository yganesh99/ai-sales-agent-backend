const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');

const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const campaignRoutes = require('./routes/campaign.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

require('./config/passport');
const passport = require('passport');
app.use(passport.initialize());

// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 200,
// });
// app.use(limiter);

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
});

app.get('/health', (req, res) =>
	res.json({ status: 'ok', uptime: process.uptime() })
);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);

// Celebrate error handler first (request validation)
app.use(errors());

// Central error handler
app.use(errorHandler);

module.exports = app;
