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
	it('should not allow a registered user to place multiple orders for an unsold car ad', (done) => {
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
					res.should.have.status(400);
					expect(res.body.error).to.equal('You have already placed an order for this car Ad.');
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
	// car with id = 335453554 does not exist
	it('should not allow a registered user to place a purchase order for a car ad that does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 335453554, buyer_id: 2, price_offered: 1400000 })
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

	// testing the endpoint for getting the sales list
	it('should return list of purchase and sales orders if the user is logged in', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/sale').set('authorization', `Bearer ${response.body.data.token}`)
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
		.get('/api/v1/sale')
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
		.patch('/api/v1/order/45/price')
		.send({ buyer_id: 4, new_price: 1500000 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
			done();
		});
	});
});

describe('Delete All the test Images from cloudinary', () => {
	it('should delete all sample images uploaded in this test execise', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				res1.body.data.forEach((car) => {
					chai.request(app)
					.delete(`/api/v1/car/${car.id}`).set('authorization', `Bearer ${response.body.data.token}`)
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
				});
			});
			response.status.should.eql(200);
    });
	});
});
