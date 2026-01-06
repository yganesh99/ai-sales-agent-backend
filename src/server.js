const mongoose = require('mongoose');
const config = require('./config');
const app = require('./app');

async function start() {
	try {
		await mongoose.connect(config.mongoUri, { autoIndex: true });
		console.log('Connected to MongoDB');

		app.listen(config.port, () => {
			console.log(`Server running on port ${config.port}`);
		});
	} catch (err) {
		console.error('Failed to start', err);
		process.exit(1);
	}
}
start();
