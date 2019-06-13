import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the orders api endpoints', () => {
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
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
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
				expect(res.body.error).to.equal('Unauthorized Access!');
				done();
			});
      response.status.should.eql(200);
    });
	});
	// car with id = 5 is owned by emmanuel
	it('should not allow a registered user to place a purchase order for his/her own car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 5, buyer_id: 2, price_offered: 1400000 })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('You can\'t place an order on your car ad.');
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
				expect(res.body.error).to.equal('Car does not exist!');
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
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access!');
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should return list of purchase and sales orders if the user is logged in', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				expect(data.sales_list.length).to.equal(0);
				expect(data.purchase_list.length).to.equal(1);
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should not return any list if the user is not logged in', (done) => {
		chai.request(app)
		.get('/api/v1/order')
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
			done();
		});
	});
});
