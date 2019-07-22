import chai, { expect } from 'chai';

import app from '../api/v1/index';

// const debug = require('debug')('http');

// testing the car ad endpoints
describe('Testing the car sale ads endpoints', () => {
	const car = {
		// year: 2001,
		state: 'Used',
		price: 5500000,
		manufacturer: 'Toyota',
		model: 'Camry R2',
		body_type: 'Hatch',
		// fuel_type: 'Petrol',
		// mileage: 3400,
		// color: 'yellow',
		// transmission_type: 'Automatic',
		// description: 'other info about the car will go here.',
		// doors: 4,
		// fuel_cap: 58,
		// ac: true,
		// arm_rest: true,
		// air_bag: true,
		// dvd_player: false,
		// fm_radio: true,
		// tinted_windows: false,
	};
	const car1 = {
		year: 2011,
		state: 'New',
		price: 2500000,
		manufacturer: 'Porche',
		model: '911',
		body_type: 'Coupe',
		fuel_type: 'Petrol',
		mileage: 3400,
		color: 'yellow',
		transmission_type: 'Automatic',
		description: 'other info about the car will go here.',
		doors: 4,
		fuel_cap: 58,
		ac: true,
		arm_rest: true,
		air_bag: true,
		dvd_player: false,
		fm_radio: true,
		tinted_windows: false,
	};
	const car2 = {
		year: 2021,
		state: 'New',
		price: 1500000,
		manufacturer: 'Mercedes-Benz',
		model: 'Escape 4W',
		body_type: 'Coupe',
		fuel_type: 'Petrol',
		mileage: 3400,
		color: 'yellow',
		transmission_type: 'Automatic',
		description: 'other info about the car will go here.',
		doors: 4,
		fuel_cap: 58,
		ac: true,
		arm_rest: true,
		air_bag: true,
		dvd_player: false,
		fm_radio: true,
		tinted_windows: false,
	};
	const car3 = {
		year: 1989,
		state: 'Used',
		price: 15000000,
		manufacturer: 'Toyota',
		model: 'Camry R2',
		body_type: 'Coupe',
		fuel_type: 'Petrol',
		mileage: 3400,
		color: 'yellow',
		transmission_type: 'Automatic',
		description: 'other info about the car will go here.',
		doors: 4,
		fuel_cap: 58,
		ac: true,
		arm_rest: true,
		air_bag: true,
		dvd_player: false,
		fm_radio: true,
		tinted_windows: false,
	};
	const car4 = {
		year: 1989,
		state: 'Used',
		price: 7400000,
		manufacturer: 'Toyota',
		model: 'Hiace',
		body_type: 'Van',
		fuel_type: 'Petrol',
		mileage: 3400,
		color: 'yellow',
		transmission_type: 'Automatic',
		description: 'other info about the car will go here.',
		doors: 4,
		fuel_cap: 58,
		ac: true,
		arm_rest: true,
		air_bag: true,
		dvd_player: false,
		fm_radio: true,
		tinted_windows: false,
	};

	let adminToken = null;
	let user1Token = null;
	let user1Id = null;
	let user2Token = null;
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
      res.status.should.eql(200);
      done();
    });
	});

	// testing endpoint for posting new car ad
	it('should allow a valid user to create a car sale ad', (done) => {
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${user1Token}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car)
		.attach('image_url', './tests/car-sample-1.jpg')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				id: data.id,
				name: data.name,
				owner_id: user1Id,
				mileage: 0,
				model: 'Camry R2',
			});
			done();
		});
	});
	/* it('should not create car ad if no image is selected', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjos@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car)
			.end((err, res) => {
				res.should.have.status(206);
				expect(res.body.error).to.equal('You have not selected any image for your post.');
				done();
			});
      response.status.should.eql(200);
    });
	}); */
	it('should not create car ad if some required fields are not filled', (done) => {
		car.model = '';
		car.price = '';
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${adminToken}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car)
		.end((err, res) => {
			res.should.have.status(206);
			expect(res.body.error).to.equal('Some required fields are not properly filled.');
			done();
		});
	});

	// create test cars
	it('create car sale ad 1', (done) => {
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${user1Token}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car1)
		.attach('image_url', './tests/car-sample-1.jpg')
		.end((err, res) => {
			res.should.have.status(201);
			done();
		});
	});
	it('create car sale ad 2', (done) => {
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${user1Token}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car2)
		.end((err, res) => {
			res.should.have.status(201);
			done();
		});
	});
	it('create car sale ad 3', (done) => {
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${user1Token}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car3)
		.end((err, res) => {
			res.should.have.status(201);
			done();
		});
	});
	it('create car sale ad 4', (done) => {
		chai.request(app)
		.post('/api/v1/car')
		.set('Authorization', `Token ${adminToken}`)
    .field('Content-Type', 'multipart/form-data')
    .field(car4)
		.attach('image_url', './tests/car-sample-1.jpg')
		.end((err, res) => {
			res.should.have.status(201);
			done();
		});
	});
	it('should not allow an unregistered user to post a car sale ad', (done) => {
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Ensure you are logged in.');
			done();
		});
	});

	// testing the get all car ads endpoint
	// this endpoint is usually for normal users
	it('should return all unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available').set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			data.map((c) => {
				expect(c).to.include({
					status: 'Available',
				});
				return 0;
			});
			expect(data.length).to.equal(5);
		});
		done();
	});
	// this is mainly used for an admin
	it('should return all car ads whether sold or not if user is an admin', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('Authorization', `Token ${adminToken}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(5);
		});
		done();
	});
	it('should filter the list of unsold car ads based on a price range', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&min_price=2000000&max_price=18000000')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data[0]).to.include({ status: 'Available' });
			expect(parseFloat(data[0].price)).to.be.above(parseFloat(2000000));
			expect(parseFloat(data[0].price)).to.be.below(parseFloat(18000000));
			expect(data.length).to.equal(4);
		});
		done();
	});
	it('should still filter the list of unsold car ads if only min_price is supplied', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&min_price=3000000')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data[0]).to.include({ status: 'Available' });
			expect(parseFloat(data[0].price)).to.be.above(parseFloat(3000000));
			expect(data.length).to.equal(3);
		});
		done();
	});
	it('should filter the list of unsold car ads based on the manufacturer', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&manufacturer=Toyota')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3);
			expect(data[0].manufacturer).to.equal('Toyota');
		});
		done();
	});
	it('should filter the list of unsold car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&body_type=Coupe')
		.set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3);
			expect(data[0].body_type).to.equal('Coupe');
		});
		done();
	});
	// this can only be done by an admin
	it('should filter the list of all car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?body_type=Coupe').set('authorization', `Bearer ${adminToken}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3);
			expect(data[0].body_type).to.equal('Coupe');
		});
		done();
	});
	it('should return all new unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&state=New').set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(2);
			expect(data[0].state).to.equal('New');
		});
		done();
	});
	it('should return all used unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available&state=Used').set('authorization', `Bearer ${user2Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3);
			expect(data[0].state).to.equal('Used');
		});
		done();
	});
	it('should return all car ads that belongs to a specific user', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}`).set('authorization', `Bearer ${user1Token}`)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(4);
		});
		done();
	});

	// testing endpoint for updating the status of a car ad
	it('should mark the car sale ad as SOLD if the user is the owner', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}`).set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/car/${car_id}/status`).set('authorization', `Bearer ${user1Token}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				data.should.have.property('status');
				data.should.have.property('owner_id');
				data.should.have.property('id');
				done();
			});
		});
	});
	it('should not update the status of the car ad if the user is not the owner', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[2].id;
			chai.request(app)
			.patch(`/api/v1/car/${car_id}/status`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access. Reserved only for resource owner.');
				done();
			});
		});
	});

	// testing endpoint for viewing a specific car sale ad
	it('should allow all users to view a car ad that is still Available', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[2].id;
			chai.request(app)
			.get(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				data.should.have.property('name');
				data.should.have.property('status');
				data.should.have.property('owner_id');
				data.should.have.property('id');
				done();
			});
		});
	});
	it('should return an error message if a user tries to view a car ad that does not exist', (done) => {
		chai.request(app)
		.get('/api/v1/car/34448444').set('authorization', `Bearer ${adminToken}`)
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});

	// testing endpoint for updating the price of an ad
	it('should update the price of the car sale ad if the user is the owner', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}`).set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[0].id;
			chai.request(app)
			.patch(`/api/v1/car/${car_id}/price`).set('authorization', `Bearer ${user1Token}`)
			.send({ price: 20000000 })
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				data.should.have.property('id');
				data.should.have.property('price');
				data.should.have.property('status');
				data.should.have.property('owner_id');
				done();
			});
		});
	});
	it('should not update the price of the car sale ad if the user is not the owner', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.patch(`/api/v1/car/${car_id}/price`).set('authorization', `Bearer ${user2Token}`)
			.send({ price: 20000000 })
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access. Reserved only for resource owner.');
				done();
			});
		});
	});
	it('should not update the price of the car sale ad if the car does not exist', (done) => {
		chai.request(app)
		.patch('/api/v1/car/48437844/price').set('authorization', `Bearer ${adminToken}`)
		.send({ price: 20000000 })
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});
	it('should not update the price of the car sale ad if the price is undefined', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.patch(`/api/v1/car/${car_id}/price`).set('authorization', `Bearer ${adminToken}`)
			.send({ price: undefined })
			.end((err, res) => {
				res.should.have.status(400);
				expect(res.body.error).to.equal('The price offered cannot be null.');
				done();
			});
		});
	});

	// testing the endpoint for deleting car ad
	it('should delete a car sale ad if the user is the owner', (done) => {
		chai.request(app)
		.get(`/api/v1/car?owner_id=${user1Id}`).set('authorization', `Bearer ${user1Token}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${user1Token}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data).to.equal('Car AD successfully deleted.');
				done();
			});
		});
	});
	it('should delete a car sale ad if the user is an admin', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[3].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${adminToken}`)
			.end((err, res) => {
				res.should.have.status(200);
				expect(res.body.data).to.equal('Car AD successfully deleted.');
				done();
			});
		});
	});
	it('should not delete a car sale ad if the user is neither an admin or the owner', (done) => {
		chai.request(app)
		.get('/api/v1/car').set('authorization', `Bearer ${adminToken}`)
		.end((err1, res1) => {
			const car_id = res1.body.data[1].id;
			chai.request(app)
			.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${user2Token}`)
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access. Reserved only for resource owner or an admin.');
				done();
			});
		});
	});
});
