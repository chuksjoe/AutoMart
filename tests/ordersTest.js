import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the orders api endpoints', () => {
	it('should allow a registered user to place a purchase order for an unsold car ad', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 1, buyer_id: 2, price_offered: 1400000 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				car_id: 1,
				price_offered: 1400000,
				buyer_id: 2,
			});
			done();
		});
	});
	// user with id = 6 does not exist
	it('should not allow an unregistered user to place a purchase order', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 5, buyer_id: 6, price_offered: 1400000 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
			done();
		});
	});
	// car with id = 2 is sold
	it('should not allow a registered user to place a purchase order for a sold car ad', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 2, buyer_id: 2, price_offered: 1400000 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
			done();
		});
	});
	// car with id = 10 does not exist
	it('should not allow a registered user to place a purchase order for a car ad that does not exist', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 8, buyer_id: 2, price_offered: 1400000 })
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.data).to.equal('Car does not exist!');
			done();
		});
	});
	it('should allow a buyer to update the price he/she offered for a posted ad if its still pending', (done) => {
		chai.request(app)
		.patch('/api/v1/order/1/price').send({ buyer_id: 2, new_price: 1500000 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				old_price_offered: data.old_price_offered,
				new_price_offered: 1500000,
				buyer_id: 2,
			});
			done();
		});
	});
	it('should not allow a user who is not the buyer to update the price offered', (done) => {
		chai.request(app)
		.patch('/api/v1/order/1/price').send({ buyer_id: 1, new_price: 1600000 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(401);
			expect(data).to.equal('Unauthorized Access!');
			done();
		});
	});
});
