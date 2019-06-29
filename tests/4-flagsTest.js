import chai, { expect } from 'chai';

import app from '../api/v1/index';

describe('Tests for the flags api endpoints', () => {
	it('should allow a registered user to flag an unsold car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/flag').set('authorization', `Bearer ${response.body.data.token}`)
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
			response.status.should.eql(200);
    });
	});
	it('should flag a second time for test purpose', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[1].id;
				chai.request(app)
				.post('/api/v1/flag').set('authorization', `Bearer ${response.body.data.token}`)
				.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
				.end((err, res) => {
					const { data } = res.body;
					res.should.have.status(201);
					data.should.have.property('status');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not allow a registered user to flag an unsold car ad multiple times', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/flag').set('authorization', `Bearer ${response.body.data.token}`)
				.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
				.end((err, res) => {
					res.should.have.status(400);
					expect(res.body.error).to.equal('You have a Pending flag on this car Ad.');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not allow a registered user to flag a sold car ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			const { token } = response.body.data;
			chai.request(app)
			.get('/api/v1/car?status=Sold')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.post('/api/v1/order').set('authorization', `Bearer ${token}`)
				.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not allow a registered user to flag his/her own car ad', (done) => {
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
				.send({ car_id, reason: 'Pricing', description: 'the price is too high' })
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
	it('should not allow a registered user to flag a car ad that does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/order').set('authorization', `Bearer ${response.body.data.token}`)
			.send({ car_id: 335453554, reason: 'Pricing', description: 'the price is too high' })
			.end((err, res) => {
				res.should.have.status(404);
				expect(res.body.error).to.equal('Car does not exist!');
				done();
			});
      response.status.should.eql(200);
    });
	});

	// testing api endpoint for getting the list of flags on a car ad
	it('should return list of flags if the user is the ad owner or an admin', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(200);
					expect(res.body.data.length).to.equal(1);
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not return list of flags if the user is not the ad owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should return an error if the car ad does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/flag/58544449').set('authorization', `Bearer ${response.body.data.token}`)
			.end((err, res) => {
				res.should.have.status(404);
				expect(res.body.error).to.equal('Car does not exist!');
				done();
			});
			response.status.should.eql(200);
    });
	});

	// testing the endpoint for marking a flag as addressed by an admin
	it('should allow an admin to mark a flag as addressed', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					const flag_id = res.body.data[0].id;
					chai.request(app)
					.patch(`/api/v1/flag/${flag_id}`).set('authorization', `Bearer ${response.body.data.token}`)
					.end((er, re) => {
						re.should.have.status(200);
						expect(re.body.data.status).to.equal('Addressed');
						done();
					});
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should return an error if an admin tries to addressed a flag more than once', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car?status=Available')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.get(`/api/v1/flag/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					const flag_id = res.body.data[0].id;
					chai.request(app)
					.patch(`/api/v1/flag/${flag_id}`).set('authorization', `Bearer ${response.body.data.token}`)
					.end((er, re) => {
						re.should.have.status(400);
						expect(re.body.error).to.equal('This Flag has been Addressed before.');
						done();
					});
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should return a 401 error if the user is not an admin', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.patch('/api/v1/flag/34454543').set('authorization', `Bearer ${response.body.data.token}`)
			.end((er, re) => {
				re.should.have.status(401);
				expect(re.body.error).to.equal('Unauthorized Access!');
				done();
			});
			response.status.should.eql(200);
    });
	});
	it('should return a 404 error if the flag does not exist', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.patch('/api/v1/flag/34454543').set('authorization', `Bearer ${response.body.data.token}`)
			.end((er, re) => {
				re.should.have.status(404);
				expect(re.body.error).to.equal('Flag not found in database.');
				done();
			});
			response.status.should.eql(200);
    });
	});
});


// delete all the images used for during this test session
describe('Delete All the test Images from cloudinary', () => {
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			const { token } = response.body.data;
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${token}`)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
			});
		});
	});
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			const { token } = response.body.data;
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${token}`)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
			});
		});
	});
	it('should delete the remaining test images from cloudinary', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			const { token } = response.body.data;
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${token}`)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
			});
		});
	});
});
