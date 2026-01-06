module.exports = (err, req, res, next) => {
	console.error(err);
	if (err.name === 'ValidationError') {
		return res.status(400).json({ message: err.message });
	}
	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
	});
};
