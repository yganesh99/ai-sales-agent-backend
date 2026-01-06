const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// Check if user exists by googleId
				let user = await User.findOne({ googleId: profile.id });
				if (user) return done(null, user);

				// Check if user exists by email
				const email =
					profile.emails && profile.emails[0]
						? profile.emails[0].value
						: null;

				if (email) {
					user = await User.findOne({ email });
					if (user) {
						// Link googleId to existing user
						user.googleId = profile.id;
						await user.save();
						return done(null, user);
					}
				}

				// Create new user
				user = new User({
					googleId: profile.id,
					email: email,
					name: profile.displayName,
				});
				await user.save();
				return done(null, user);
			} catch (err) {
				return done(err, false);
			}
		}
	)
);

module.exports = passport;
