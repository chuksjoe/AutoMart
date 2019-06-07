import chai, { expect } from 'chai';

import app from '../api/v1/index';
import users from '../api/v1/models/users';

describe('Tests for the orders api endpoints', () => {
	it('should allow a user to sign into their account if they supply valid credentials', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
		.end((err, res) => {
			res.should.have.status(200);
			done();
		});
	});
	it('should allow a registered user to place a purchase order for an unsold car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 1, buyer_id: 2, price_offered: 1400000 })
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
      response.status.should.eql(200);
    });
	});
	// user with id = 6 does not exist
	it('should not allow an unregistered user to place a purchase order', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 5, buyer_id: 6, price_offered: 1400000 })
		.end((err, res) => {
			res.should.have.status(400);
			expect(res.body.data).to.equal('Ensure you are logged in.');
			done();
		});
	});
	// car with id = 2 is sold
	it('should not allow a registered user to place a purchase order for a sold car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 2, buyer_id: 2, price_offered: 1400000 })
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.data).to.equal('Unauthorized Access!');
				done();
			});
      response.status.should.eql(200);
    });
	});
	// car with id = 25 does not exist
	it('should not allow a registered user to place a purchase order for a car ad that does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 25, buyer_id: 2, price_offered: 1400000 })
			.end((err, res) => {
				res.should.have.status(404);
				expect(res.body.data).to.equal('Car does not exist!');
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should allow a buyer to update the price he/she offered for a posted ad if its still pending', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.patch('/api/v1/order/1/price').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ buyer_id: 2, new_price: 1500000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				expect(data).to.include({
					old_price_offered: data.old_price_offered,
					new_price_offered: 1500000,
					buyer_id: 2,
				});
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should not allow a user who is not the buyer to update the price offered', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.patch('/api/v1/order/1/price').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ buyer_id: 1, new_price: 1600000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(401);
				expect(data).to.equal('Unauthorized Access!');
				done();
			});
      response.status.should.eql(200);
    });
	});
});
