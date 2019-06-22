import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the orders api endpoints', () => {
	it('should allow a registered user to place a purchase order for an unsold car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
    	chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
				.send({ car_id, buyer_id: response.body.data.id, price_offered: 1400000 })
				.end((err, res) => {
					const { data } = res.body;
					res.should.have.status(201);
					data.should.have.property('status');
					data.should.have.property('car_id');
					data.should.have.property('buyer_id');
					data.should.have.property('price_offered');
					done();
				});
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
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
    	const { id, token } = response.body.data;
			chai.request(app)
			.get('/api/v1/car?status=Sold')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/order').set('authorization', `Bearer ${token}`)
				.send({ car_id, buyer_id: id, price_offered: 1400000 })
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	// car with id = 5 is owned by emmanuel
	it('should not allow a registered user to place a purchase order for his/her own car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
	  	const { id, token } = response.body.data;
			chai.request(app)
			.get(`/api/v1/car?owner_id=${id}`)
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/order').set('authorization', `Bearer ${token}`)
				.send({ car_id, buyer_id: id, price_offered: 1400000 })
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.have.property('error');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	// car with id = 09b26b5e-0e41-4d17-9b3f-33bffed0742a does not exist
	it('should not allow a registered user to place a purchase order for a car ad that does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 34, buyer_id: 2, price_offered: 1400000 })
			.end((err, res) => {
				res.should.have.status(404);
				expect(res.body.error).to.equal('Car does not exist!');
				done();
			});
      response.status.should.eql(200);
    });
	});

	// testing the endpoint for getting the list of purchase orders
	it('should return list of purchase and sales orders if the user is logged in', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				expect(data.length).to.equal(1);
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

	// testing the endpoint for updating the price offered for a car ad
	it('should allow a buyer to update the price he/she offered for a posted ad if its still pending', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
	  	const { id, token } = response.body.data;
			chai.request(app)
			.get('/api/v1/order').set('authorization', `Bearer ${token}`)
			.end((err1, res1) => {
				const order_id = res1.body.data[0].id;
				chai.request(app)
				.patch(`/api/v1/order/${order_id}/price`).set('authorization', `Bearer ${token}`)
				.send({ buyer_id: id, new_price: 1500000 })
				.end((err, res) => {
					const { data } = res.body;
					res.should.have.status(200);
					data.should.have.property('old_price_offered');
					data.should.have.property('new_price_offered');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not allow a user who is not logged in to have access to the update endpoint', (done) => {
		chai.request(app)
		.patch('/api/v1/order/09b26b5e-0e41-4d17-9b3f-33bffed0742a/price')
		.send({ buyer_id: 4, new_price: 1500000 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
			done();
		});
	});
	/*
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
	*/
});
