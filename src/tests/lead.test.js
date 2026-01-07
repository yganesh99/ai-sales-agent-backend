const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose model
jest.mock('../models/lead.model', () => {
	return jest.fn().mockImplementation(function (data) {
		Object.assign(this, data);
		this.save = jest.fn().mockResolvedValue(this);
	});
});

const Lead = require('../models/lead.model');
const app = require('../app');

// Attach static methods to the mock
Lead.find = jest.fn();
Lead.findById = jest.fn();
Lead.findByIdAndUpdate = jest.fn();
Lead.countDocuments = jest.fn();

describe('Lead API', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset defaults
		Lead.prototype.save = jest.fn().mockResolvedValue({});
	});

	const mockLead = {
		_id: '659c470a1a1a1a1a1a1a1a1a',
		lead_type: 'hot',
		campaignId: 'camp_123',
		source: 'web_form',
		name: 'John Doe',
		email: 'john@example.com',
		phone: '1234567890',
		score: 85,
		intent: 'high',
		urgency: 'medium',
		summary: 'Interested in buying',
		createdBy: 'user_1',
		lastUpdatedBy: 'user_1',
		isDeleted: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	describe('POST /api/leads', () => {
		it('should create a new lead', async () => {
			// Setup the constructor implementation for this test if needed, s
			// but the default mock implementation we defined above should work:
			// it copies data and has a .save() method.

			const res = await request(app).post('/api/leads').send({
				lead_type: 'hot',
				campaignId: 'camp_123',
				source: 'web_form',
				name: 'John Doe',
				email: 'john@example.com',
				phone: '1234567890',
				score: 85,
				intent: 'high',
				urgency: 'medium',
				summary: 'Interested in buying',
				createdBy: 'user_1',
				lastUpdatedBy: 'user_1',
			});

			expect(res.statusCode).toEqual(201);
			expect(res.body.email).toEqual('john@example.com');
		});

		it('should validate required fields', async () => {
			const res = await request(app).post('/api/leads').send({
				name: 'Incomplete Lead',
			});

			expect(res.statusCode).toEqual(400);
		});
	});

	describe('GET /api/leads', () => {
		it('should return all leads', async () => {
			Lead.find.mockReturnValue({
				limit: jest.fn().mockReturnValue({
					skip: jest.fn().mockReturnValue({
						exec: jest.fn().mockResolvedValue([mockLead]),
					}),
				}),
			});
			Lead.countDocuments.mockResolvedValue(1);

			const res = await request(app).get('/api/leads');

			expect(res.statusCode).toEqual(200);
			expect(res.body.leads.length).toEqual(1);
			expect(res.body.leads[0].name).toEqual('John Doe');
		});
	});

	describe('GET /api/leads/:id', () => {
		it('should return a lead by id', async () => {
			Lead.findById.mockResolvedValue(mockLead);

			const res = await request(app).get(
				'/api/leads/659c470a1a1a1a1a1a1a1a1a'
			);

			expect(res.statusCode).toEqual(200);
			expect(res.body.name).toEqual('John Doe');
		});

		it('should return 404 if not found', async () => {
			Lead.findById.mockResolvedValue(null);

			const res = await request(app).get(
				'/api/leads/659c470a1a1a1a1a1a1a1a1a'
			);

			expect(res.statusCode).toEqual(404);
		});
	});

	describe('PUT /api/leads/:id', () => {
		it('should update a lead', async () => {
			Lead.findByIdAndUpdate.mockResolvedValue({
				...mockLead,
				name: 'Jane Doe',
			});

			const res = await request(app)
				.put('/api/leads/659c470a1a1a1a1a1a1a1a1a')
				.send({ name: 'Jane Doe' });

			expect(res.statusCode).toEqual(200);
			expect(res.body.name).toEqual('Jane Doe');
		});
	});

	describe('DELETE /api/leads/:id', () => {
		it('should soft delete a lead', async () => {
			Lead.findByIdAndUpdate.mockResolvedValue({
				...mockLead,
				isDeleted: true,
			});

			const res = await request(app).delete(
				'/api/leads/659c470a1a1a1a1a1a1a1a1a'
			);

			expect(res.statusCode).toEqual(204);
		});
	});
});
