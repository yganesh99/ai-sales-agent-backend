const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose model
jest.mock('../models/campaign.model', () => {
	return jest.fn().mockImplementation(function (data) {
		Object.assign(this, data);
		this.save = jest.fn().mockResolvedValue(this);
	});
});

const Campaign = require('../models/campaign.model');
const app = require('../app');

// Attach static methods to the mock
Campaign.find = jest.fn();
Campaign.findById = jest.fn();
Campaign.findByIdAndUpdate = jest.fn();
Campaign.countDocuments = jest.fn();

describe('Campaign API', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset defaults
		Campaign.prototype.save = jest.fn().mockResolvedValue({});
	});

	const mockCampaign = {
		_id: '659c470a1a1a1a1a1a1a1a1b',
		title: 'Summer Sale',
		description: 'Biggest sale of the year',
		valueProp: '50% off everything',
		painPoints: 'Items are expensive',
		cta: 'Shop Now',
		constraints: 'US only',
		createdBy: 'user_1',
		lastUpdatedBy: 'user_1',
		isDeleted: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	describe('POST /api/campaigns', () => {
		it('should create a new campaign', async () => {
			const res = await request(app).post('/api/campaigns').send({
				title: 'Summer Sale',
				description: 'Biggest sale of the year',
				valueProp: '50% off everything',
				painPoints: 'Items are expensive',
				cta: 'Shop Now',
				constraints: 'US only',
				createdBy: 'user_1',
				lastUpdatedBy: 'user_1',
			});

			expect(res.statusCode).toEqual(201);
			expect(res.body.title).toEqual('Summer Sale');
		});

		it('should validate required fields', async () => {
			const res = await request(app).post('/api/campaigns').send({
				title: 'Incomplete Campaign',
			});

			expect(res.statusCode).toEqual(400);
		});
	});

	describe('GET /api/campaigns', () => {
		it('should return all campaigns', async () => {
			Campaign.find.mockReturnValue({
				limit: jest.fn().mockReturnValue({
					skip: jest.fn().mockReturnValue({
						exec: jest.fn().mockResolvedValue([mockCampaign]),
					}),
				}),
			});
			Campaign.countDocuments.mockResolvedValue(1);

			const res = await request(app).get('/api/campaigns');

			expect(res.statusCode).toEqual(200);
			expect(res.body.campaigns.length).toEqual(1);
			expect(res.body.campaigns[0].title).toEqual('Summer Sale');
		});
	});

	describe('GET /api/campaigns/:id', () => {
		it('should return a campaign by id', async () => {
			Campaign.findById.mockResolvedValue(mockCampaign);

			const res = await request(app).get(
				'/api/campaigns/659c470a1a1a1a1a1a1a1a1b'
			);

			expect(res.statusCode).toEqual(200);
			expect(res.body.title).toEqual('Summer Sale');
		});

		it('should return 404 if not found', async () => {
			Campaign.findById.mockResolvedValue(null);

			const res = await request(app).get(
				'/api/campaigns/659c470a1a1a1a1a1a1a1a1b'
			);

			expect(res.statusCode).toEqual(404);
		});
	});

	describe('PUT /api/campaigns/:id', () => {
		it('should update a campaign', async () => {
			Campaign.findByIdAndUpdate.mockResolvedValue({
				...mockCampaign,
				title: 'Winter Sale',
			});

			const res = await request(app)
				.put('/api/campaigns/659c470a1a1a1a1a1a1a1a1b')
				.send({ title: 'Winter Sale' });

			expect(res.statusCode).toEqual(200);
			expect(res.body.title).toEqual('Winter Sale');
		});
	});

	describe('DELETE /api/campaigns/:id', () => {
		it('should soft delete a campaign', async () => {
			Campaign.findByIdAndUpdate.mockResolvedValue({
				...mockCampaign,
				isDeleted: true,
			});

			const res = await request(app).delete(
				'/api/campaigns/659c470a1a1a1a1a1a1a1a1b'
			);

			expect(res.statusCode).toEqual(204);
		});
	});
});
