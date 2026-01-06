const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: { type: String, select: false },
	googleId: { type: String, unique: true, sparse: true },
	name: { type: String },
	roles: { type: [String], default: ['user'] },
	createdAt: { type: Date, default: Date.now },
});

// hash password before save
userSchema.pre('save', async function (next) {
	if (!this.isModified('password') || !this.password) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = function (candidate) {
	return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
