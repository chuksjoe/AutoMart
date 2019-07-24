import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the flags api endpoints', () => {
	let adminToken = null;
	let adminId = null;
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
			adminId = res.body.data.id;
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

	it('should allow a registered user to flag an unsold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/flag').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(201);
				data.should.have.property('status');
				data.should.have.property('car_id');
				data.should.have.property('reporter_id');
				data.should.have.property('reason');
				done();
			});
		});
	});
	it('should flag a second time for test purpose', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.post('/api/v1/flag').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(201);
				data.should.have.property('status');
				done();
			});
		});
	});
	it('should not allow a registered user to flag an unsold car ad multiple times', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/flag').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('You have a Pending flag on this car Ad.');
				done();
			});
		});
	});
	it('should not allow a registered user to flag a sold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Sold')
		.set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/flag').set('authorization', `Bearer ${user2Token}`)
			.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('Car already sold.');
				done();
			});
		});
	});
	it('should not allow a registered user to flag his/her own car ad', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}&status=Available`)
		.set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.post('/api/v1/flag').set('authorization', `Bearer ${user1Token}`)
			.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.have.property('error');
				expect(res.body.error).to.equal('You can\'t place a flag on your car ad.');
				done();
			});
		});
	});
	it('should not flag a car Ad if the car ID is not supplied', (done) => {
		chai.request(app)
		.post('/api/v1/flag').set('authorization', `Bearer ${user2Token}`)
		.send({ car_id: '', reason: 'Pricing', description: 'the price is too high' })
		.end((err, res) => {
			res.should.have.status(206);
			res.body.should.have.property('error');
			expect(res.body.error).to.equal('The car ID is required');
			done();
		});
	});
	it('should not flag a car Ad if the reason or description is not supplied', (done) => {
		chai.request(app)
		.post('/api/v1/flag').set('authorization', `Bearer ${user1Token}`)
		.send({ car_id: 34, reason: '', description: 'the price is too high' })
		.end((err, res) => {
			res.should.have.status(206);
			res.body.should.have.property('error');
			expect(res.body.error).to.equal('Reason and Description cannot be null.');
			done();
		});
	});
	// car with id = 335453554 does not exist
	it('should not allow a registered user to flag a car ad that does not exist', (done) => {
		chai.request(app)
		.post('/api/v1/flag').set('authorization', `Bearer ${user1Token}`)
		.send({ car_id: 335453554, reason: 'Pricing', description: 'the price is too high' })
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});

	// testing api endpoint for getting the list of flags on a car ad
	it('should return list of flags if the user is the ad owner or an admin', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${user1Token}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data.length).to.equal(1);
				done();
			});
		});
	});
	it('should not return list of flags if the user is not the ad owner', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${user2Token}`)
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access. Reserved only for resource owner or an admin.');
				done();
			});
		});
	});
	it('should return an error if the car ad does not exist', (done) => {
		chai.request(app)
		.get('/api/v1/flag/58544449').set('authorization', `Bearer ${user1Token}`)
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});

	// testing the endpoint for marking a flag as addressed by an admin
	it('should allow an admin to mark a flag as addressed', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				const flag_id = res.body.data[0].id;
				chai.request(app)
				.patch(`/api/v1/flag/${flag_id}/status`).set('authorization', `Bearer ${adminToken}`)
				.end((er, re) => {
					re.should.have.status(200);
					expect(re.body.data.status).to.equal('Addressed');
					done();
				});
			});
		});
	});
	it('should return an error if an admin tries to addressed a flag more than once', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				const flag_id = res.body.data[0].id;
				chai.request(app)
				.patch(`/api/v1/flag/${flag_id}/status`).set('authorization', `Bearer ${adminToken}`)
				.end((er, re) => {
					re.should.have.status(400);
					expect(re.body.error).to.equal('This Flag has been Addressed before.');
					done();
				});
			});
		});
	});
	it('should return a 401 error if the user is not an admin', (done) => {
		chai.request(app)
		.patch('/api/v1/flag/34454543/status').set('authorization', `Bearer ${user2Token}`)
		.end((er, re) => {
			re.should.have.status(401);
			expect(re.body.error).to.equal('Unauthorized Access. Reserved only for admins.');
			done();
		});
	});
	it('should return a 404 error if the flag does not exist', (done) => {
		chai.request(app)
		.patch('/api/v1/flag/34454543/status').set('authorization', `Bearer ${adminToken}`)
		.end((er, re) => {
			re.should.have.status(404);
			expect(re.body.error).to.equal('Flag not found in database.');
			done();
		});
	});

	// testing api endpoint for deleting a flag by an admin
	it('should allow an admin to delete a flag on a car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				const flag_id = res.body.data[0].id;
				chai.request(app)
				.delete(`/api/v1/flag/${flag_id}`).set('authorization', `Bearer ${adminToken}`)
				.end((er, re) => {
					re.should.have.status(200);
					re.body.should.have.property('data');
					re.body.should.have.property('message');
					done();
				});
			});
		});
	});
	it('should return a 401 error if the user tries to delete a flag', (done) => {
		chai.request(app)
		.delete('/api/v1/flag/34454543').set('authorization', `Bearer ${adminToken}`)
		.end((er, re) => {
			re.should.have.status(404);
			expect(re.body.error).to.equal('Flag not found in database.');
			done();
		});
	});
	it('should return a 401 error if the user tries to delete a flag', (done) => {
		chai.request(app)
		.delete('/api/v1/flag/34454543').set('authorization', `Bearer ${user2Token}`)
		.end((er, re) => {
			re.should.have.status(401);
			expect(re.body.error).to.equal('Unauthorized Access. Reserved only for admins.');
			done();
		});
	});
});
/* ================ END OF MAIN TEST ======================== */

// delete all the images used for during this test session
describe('Delete All the test Images from cloudinary', () => {
	let adminToken = null;
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
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
	});
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
	});
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
		});
	});
});
