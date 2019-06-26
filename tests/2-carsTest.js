import chai, { expect } from 'chai';

import app from '../api/v1/index';

// const debug = require('debug')('http');

// testing the car ad endpoints
describe('Testing the car sale ads endpoints', () => {
	const car = {
		year: 2001,
		state: 'Used',
		price: 5500000,
		manufacturer: 'Toyota',
		model: 'Camry R2',
		body_type: 'Hatch',
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

	// testing endpoint for posting new car ad
	it('should allow a valid user to create a car sale ad', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car)
			.attach('img_url', './tests/car-sample-1.jpg')
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(201);
				expect(data).to.include({
					id: data.id,
					name: data.name,
					owner_id: response.body.data.id,
					mileage: 3400,
					model: 'Camry R2',
				});
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should not create car ad if no image is selected', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
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
	});
	it('should not create car ad if some required fields are not filled', (done) => {
		car.model = '';
		car.price = '';
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car)
			.end((err, res) => {
				res.should.have.status(206);
				expect(res.body.error).to.equal('Some required fields are not properly filled.');
				done();
			});
      response.status.should.eql(200);
    });
	});

	// create test cars
	it('create car sale ad 1', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car1)
			.attach('img_url', './tests/car-sample-1.jpg')
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
    });
	});
	it('create car sale ad 2', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car2)
			.attach('img_url', './tests/car-sample-1.jpg')
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
    });
	});
	it('create car sale ad 3', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car3)
			.attach('img_url', './tests/car-sample-1.jpg')
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
    });
	});
	it('create car sale ad 4', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.post('/api/v1/car')
			.set('Authorization', `Token ${response.body.data.token}`)
      .field('Content-Type', 'multipart/form-data')
      .field(car4)
			.attach('img_url', './tests/car-sample-1.jpg')
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
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
		.get('/api/v1/car?status=Available')
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
	it('should return all car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car')
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
		.get('/api/v1/car?body_type=Coupe')
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
		.get('/api/v1/car?status=Available&state=New')
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
		.get('/api/v1/car?status=Available&state=Used')
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
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
	  	chai.request(app)
			.get(`/api/v1/car?owner_id=${response.body.data.id}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				expect(data.length).to.equal(1);
			});
			done();
		});
	});

	// testing endpoint for updating the status of a car ad
	it('should mark the car sale ad as SOLD if the user is the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get(`/api/v1/car?owner_id=${response.body.data.id}`)
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.patch(`/api/v1/car/${car_id}/status`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					const { data } = res.body;
					res.should.have.status(200);
					data.should.have.property('status');
					data.should.have.property('owner_id');
					data.should.have.property('id');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not update the status of the car ad if the user is not the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[2].id;
				chai.request(app)
				.patch(`/api/v1/car/${car_id}/status`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});

	// testing endpoint for viewing a specific car sale ad
	it('should allow all users to view a car ad that is still Available', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=Available')
		.end((err1, res1) => {
			const car_id = res1.body.data[2].id;
			chai.request(app)
			.get(`/api/v1/car/${car_id}`)
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
		.get('/api/v1/car/34448444')
		.end((err, res) => {
			res.should.have.status(404);
			expect(res.body.error).to.equal('Car not found in database.');
			done();
		});
	});

	// testing endpoint for updating the price of an ad
	it('should update the price of the car sale ad if the user is the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get(`/api/v1/car?owner_id=${response.body.data.id}`)
			.end((err1, res1) => {
				const car_id = res1.body.data[0].id;
				chai.request(app)
				.patch(`/api/v1/car/${car_id}/price`).set('authorization', `Bearer ${response.body.data.token}`)
				.send({ new_price: 20000000 })
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
			response.status.should.eql(200);
    });
	});
	it('should not update the price of the car sale ad if the user is not the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[1].id;
				chai.request(app)
				.patch(`/api/v1/car/${car_id}/price`).set('authorization', `Bearer ${response.body.data.token}`)
				.send({ new_price: 20000000 })
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});

	// testing the endpoint for deleting car ad
	it('should delete a car sale ad if the user is the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get(`/api/v1/car?owner_id=${response.body.data.id}`)
			.end((err1, res1) => {
				const car_id = res1.body.data[1].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(200);
					expect(res.body.data).to.equal('Car AD successfully deleted.');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should delete a car sale ad if the user is an admin', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[1].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(200);
					expect(res.body.data).to.equal('Car AD successfully deleted.');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
	it('should not delete a car sale ad if the user is neither an admin or the owner', (done) => {
		chai.request(app)
    .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing@123' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/car')
			.end((err1, res1) => {
				const car_id = res1.body.data[1].id;
				chai.request(app)
				.delete(`/api/v1/car/${car_id}`).set('authorization', `Bearer ${response.body.data.token}`)
				.end((err, res) => {
					res.should.have.status(401);
					expect(res.body.error).to.equal('Unauthorized Access!');
					done();
				});
			});
			response.status.should.eql(200);
    });
	});
});
