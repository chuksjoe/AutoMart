import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the orders api endpoints', () => {
	let adminToken = null;
	let user1Token = null;
	let user1Id = null;
	let user2Token = null;
	let user2Id = null;
	// login in the users for this test script
	it('should login an admin', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjos@live.com', password: 'testing@123' })
    .end((err, res) => {
			adminToken = res.body.data.token;
			res.status.should.eql(200);
      done();
    });
	});
	it('should login an user1', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((err, res) => {
			user1Token = res.body.data.token;
			user1Id	= res.body.data.id;
      res.status.should.eql(200);
      done();
    });
	});
	it('should login an user2', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((err, res) => {
			user2Token = res.body.data.token;
			user2Id = res.body.data.id;
      res.status.should.eql(200);
      done();
    });
	});

	it('should allow a registered user to place a purchase order for an unsold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('Authorization', `Token ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, buyer_id: user2Id, amount: 1400000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(201);
				data.should.have.property('status');
				data.should.have.property('car_id');
				data.should.have.property('buyer_id');
				data.should.have.property('amount');
				done();
			});
		});
	});
	it('should place a second order for test purpose', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('Authorization', `Token ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, buyer_id: user2Id, amount: 1400000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(201);
				data.should.have.property('status');
				done();
			});
		});
	});
	it('should not place order if the amount is undefined', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('Authorization', `Token ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, buyer_id: user2Id, amount: undefined })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('The price offered cannot be null.');
				done();
			});
		});
	});
	it('should not allow a registered user to place multiple orders for an unsold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('Authorization', `Token ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, buyer_id: user2Id, amount: 1400000 })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('You have a Pending offer on this car Ad.');
				done();
			});
		});
	});
	// user with id = 6 does not exist
	it('should not allow an unregistered user to place a purchase order', (done) => {
		chai.request(app)
		.post('/api/v1/order').send({ car_id: 5, buyer_id: 6, amount: 1400000 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
			done();
		});
	});
	it('should not allow a registered user to place a purchase order for a sold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Sold')
		.set('Authorization', `Token ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, buyer_id: user2Id, amount: 1400000 })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('Car already sold.');
				done();
			});
		});
	});
	/* it('should not allow a registered user to place a purchase order for his/her own car ad', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}&status=Available`)
		.set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${user1Token}`)
			.send({ car_id, buyer_id: user1Id, amount: 1400000 })
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.have.property('error');
				expect(res.body.error).to.equal('You can\'t place an order on your car ad.');
				done();
			});
		});
	}); */
	// car with id = 335453554 does not exist
	it('should not allow a registered user to place a purchase order for a car ad that does not exist', (done) => {
		chai.request(app)
		.post('/api/v1/order').set('authorization', `Bearer ${user1Token}`)
		.send({ car_id: 335453554, buyer_id: user1Id, amount: 1400000 })
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});

	// testing the endpoint for getting the list of purchase orders
	it('should return list of purchase and sales orders if the user is logged in', (done) => {
		chai.request(app)
		.get('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(2);
			done();
		});
	});

	// testing the endpoint for getting the sales list
	it('should return list of purchase and sales orders if the user is logged in', (done) => {
		chai.request(app)
		.get('/api/v1/sale').set('authorization', `Bearer ${user1Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(1);
			done();
		});
	});

	// testing the endpoint for updating the price offered for a car ad
	it('should allow a buyer to update the price he/she offered for a posted ad if its still pending', (done) => {
		chai.request(app)
		.get('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/order/${order_id}/price`).set('authorization', `Bearer ${user2Token}`)
			.send({ buyer_id: user2Id, price: 1500000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				data.should.have.property('old_price_offered');
				data.should.have.property('new_price_offered');
				done();
			});
		});
	});
	it('should fail if the price is undefined', (done) => {
		chai.request(app)
		.get('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/order/${order_id}/price`).set('authorization', `Bearer ${user2Token}`)
			.send({ buyer_id: user2Id, price: undefined })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('The price offered cannot be null.');
				done();
			});
		});
	});

	// testing api endpoint for accepting a purchase offer
	it('should not accept an order that does not exit', (done) => {
		chai.request(app)
		.patch('/api/v1/order/566554/accept').set('authorization', `Bearer ${user1Token}`)
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Order not found in database.');
			done();
		});
	});
	it('should allow the owner of the car ad to accept the offer', (done) => {
		chai.request(app)
		.get('/api/v1/sale').set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/order/${order_id}/accept`).set('authorization', `Bearer ${user1Token}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data.status).to.equal('Accepted');
				done();
			});
		});
	});
	it('should not accept an already accepted offer', (done) => {
		chai.request(app)
		.get('/api/v1/sale').set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/order/${order_id}/accept`).set('authorization', `Bearer ${user1Token}`)
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('The offer is not available.');
				done();
			});
		});
	});

// testing api endpoint for rejecting a purchase offer
	it('should not reject an order that does not exit', (done) => {
		chai.request(app)
		.patch('/api/v1/order/566554/reject').set('authorization', `Bearer ${user1Token}`)
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Order not found in database.');
			done();
		});
	});
	it('should allow the owner of the car ad to reject the offer', (done) => {
		chai.request(app)
		.get('/api/v1/sale').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/order/${order_id}/reject`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data.status).to.equal('Rejected');
				done();
			});
		});
	});

	// testing api endpoint for deleting/cancelling a purchase order
	it('should not delete an order that does not exit', (done) => {
		chai.request(app)
		.delete('/api/v1/order/566554').set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Order not found in database.');
			done();
		});
	});
	it('should allow a buyer to delete purchase order he/she had placed', (done) => {
		chai.request(app)
		.get('/api/v1/order').set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const order_id = res1.body.data[0].id;
			chai.request(app)
			.delete(`/api/v1/order/${order_id}`).set('authorization', `Bearer ${user2Token}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data).to.equal('Purchase order successfully deleted.');
				done();
			});
		});
	});
});
