// import chai, { expect } from 'chai';

// import app from '../api/v1/index';

// const debug = require('debug')('http');

// // testing the car ad endpoints
// describe('Testing the car sale ads endpoints', () => {
// 	const car = {
// 		year: 2001,
// 		state: 'Used',
// 		status: 'Available',
// 		price: 5500000.20,
// 		manufacturer: 'Toyota',
// 		model: 'Camry R2',
// 		body_type: 'Hatch',
// 		fuel_type: 'petrol',
// 		mileage: 3400,
// 		color: 'yellow',
// 		transmission_type: 'Automatic',
// 		description: 'other info about the car will go here.',
// 		doors: 4,
// 		fuel_cap: 58,
// 		ac: true,
// 		arm_rest: true,
// 		air_bag: true,
// 		dvd_player: false,
// 		fm_radio: true,
// 		tinted_windows: false,
// 	};

// 	it('should allow a valid user to create a car sale ad', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.post('/api/v1/car')
// 			.set('Authorization', `Token ${response.body.data.token}`)
//       .field('Content-Type', 'multipart/form-data')
//       .field(car)
// 			.attach('img_url', './tests/car-sample-1.jpg')
// 			.end((err, res) => {
// 				if (err) {
// 					debug(err);
// 					process.exit(1);
// 				}
// 				const { data } = res.body;
// 				res.should.have.status(201);
// 				expect(data).to.include({
// 					id: data.id,
// 					name: data.name,
// 					owner_id: 1,
// 					mileage: 3400,
// 					model: 'Camry R2',
// 				});
// 				done();
// 			});
//       response.status.should.eql(200);
//     });
// 	});
// 	it('should not create car ad if no image is selected', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.post('/api/v1/car')
// 			.set('Authorization', `Token ${response.body.data.token}`)
//       .field('Content-Type', 'multipart/form-data')
//       .field(car)
// 			.end((err, res) => {
// 				res.should.have.status(206);
// 				expect(res.body.error).to.equal('You have not selected any image for your post.');
// 				done();
// 			});
//       response.status.should.eql(200);
//     });
// 	});
// 	it('should not create car ad if some required fields are not filled', (done) => {
// 		car.model = '';
// 		car.price = '';
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.post('/api/v1/car')
// 			.set('Authorization', `Token ${response.body.data.token}`)
//       .field('Content-Type', 'multipart/form-data')
//       .field(car)
// 			.end((err, res) => {
// 				res.should.have.status(206);
// 				expect(res.body.error).to.equal('Some required fields are not properly filled.');
// 				done();
// 			});
//       response.status.should.eql(200);
//     });
// 	});
// 	// test for creating new car sale ad if the user is not registered
// 	it('should not allow an unregistered user to post a car sale ad', (done) => {
// 		chai.request(app)
// 		.post('/api/v1/car').set('Accept', 'application/json').send(car)
// 		.end((err, res) => {
// 			res.should.have.status(401);
// 			expect(res.body.error).to.equal('Ensure you are logged in.');
// 			done();
// 		});
// 	});
// 	// test for viewing a specific car sale ad that is still Available
// 	// this endpoint is usually for normal users
// 	it('should allow all users to view a car ad that is still Available', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car/1')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data).to.include({
// 				id: data.id,
// 				name: data.name,
// 				price: data.price,
// 			});
// 			done();
// 		});
// 	});
// 	it('should return an error message if a user tries to view a car ad that does not exist', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car/21')
// 		.end((err, res) => {
// 			res.should.have.status(404);
// 			expect(res.body.error).to.equal('Car not found in database.');
// 			done();
// 		});
// 	});
// 	// this endpoint is usually for normal users
// 	it('should return all unsold car ads', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			data.map((c) => {
// 				expect(c).to.include({
// 					status: 'Available',
// 				});
// 				return 0;
// 			});
// 			expect(data.length).to.equal(12); // plus 11 in carData.js + 1 created here
// 		});
// 		done();
// 	});
// 	// this is mainly used for an admin
// 	it('should return all car ads', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(13); // 12 in the car model + 1 created in this test script
// 		});
// 		done();
// 	});
// 	it('should filter the list of unsold car ads based on a price range', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&min_price=20000000&max_price=30000000')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data[0]).to.include({ status: 'Available' });
// 			expect(data[0].price).to.be.above(20000000);
// 			expect(data[0].price).to.be.below(30000000);
// 			expect(data.length).to.equal(5);
// 		});
// 		done();
// 	});
// 	it('should still filter the list of unsold car ads if only min_price is supplied', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&min_price=26000000')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data[0]).to.include({ status: 'Available' });
// 			expect(data[0].price).to.be.above(26000000);
// 			expect(data.length).to.equal(5);
// 		});
// 		done();
// 	});
// 	it('should filter the list of unsold car ads based on the manufacturer', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&manufacturer=Mercedes-Benz')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(1);
// 			expect(data[0].manufacturer).to.equal('Mercedes-Benz');
// 		});
// 		done();
// 	});
// 	it('should filter the list of unsold car ads based on the body type', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&body_type=Coupe')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(7);
// 			expect(data[0].body_type).to.equal('Coupe');
// 		});
// 		done();
// 	});
// 	// this can only be done by an admin
// 	it('should filter the list of all car ads based on the body type', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?body_type=Coupe')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(7);
// 			expect(data[0].body_type).to.equal('Coupe');
// 		});
// 		done();
// 	});
// 	it('should return all new unsold car ads', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&state=New')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(5);
// 			expect(data[0].state).to.equal('New');
// 		});
// 		done();
// 	});
// 	it('should return all used unsold car ads', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?status=Available&state=Used')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(7); // 6 defined in the car model and 1 defined in this script
// 			expect(data[0].state).to.equal('Used');
// 		});
// 		done();
// 	});
// 	it('should return all car ads that belongs to a specific user', (done) => {
// 		chai.request(app)
// 		.get('/api/v1/car?owner_id=2')
// 		.end((err, res) => {
// 			const { data } = res.body;
// 			res.should.have.status(200);
// 			expect(data.length).to.equal(4);
// 		});
// 		done();
// 	});
// 	it('should delete a car sale ad if the user is the owner', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.delete('/api/v1/car/3').set('authorization', `Bearer ${response.body.data.token}`)
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				expect(res.body.data).to.equal('Car AD successfully deleted.');
// 			});
// 			done();
//       response.status.should.eql(200);
//     });
// 	});
// 	it('should delete a car sale ad if the user is an admin', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.delete('/api/v1/car/11').set('authorization', `Bearer ${response.body.data.token}`)
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				expect(res.body.data).to.equal('Car AD successfully deleted.');
// 			});
// 			done();
//       response.status.should.eql(200);
//     });
// 	});
// 	it('should not delete a car sale ad if the user is neither an admin or the owner', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'emma@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.delete('/api/v1/car/12').set('authorization', `Bearer ${response.body.data.token}`)
// 			.end((err, res) => {
// 				res.should.have.status(401);
// 				expect(res.body.error).to.equal('Unauthorized Access!');
// 			});
// 			done();
//       response.status.should.eql(200);
//     });
// 	});
// 	it('should update the price of the car sale ad if the user is the owner', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.patch('/api/v1/car/1/price').set('authorization', `Bearer ${response.body.data.token}`)
// 			.send({ new_price: 20000000 })
// 			.end((err, res) => {
// 				const { data } = res.body;
// 				res.should.have.status(200);
// 				expect(data).to.include({
// 					price: 20000000,
// 					id: 1,
// 					owner_id: 3,
// 				});
// 				done();
// 			});
// 			response.status.should.eql(200);
//     });
// 	});
// 	it('should mark the car sale ad as SOLD if the user is the owner', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.patch('/api/v1/car/4/status').set('authorization', `Bearer ${response.body.data.token}`)
// 			.end((err, res) => {
// 				const { data } = res.body;
// 				res.should.have.status(200);
// 				expect(data).to.include({
// 					status: 'Sold',
// 					id: 4,
// 					owner_id: 3,
// 				});
// 				done();
// 			});
// 			response.status.should.eql(200);
//     });
// 	});
// 	it('should not update the car ad if the user is not the owner', (done) => {
// 		chai.request(app)
//     .post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
//     .end((error, response) => {
// 			chai.request(app)
// 			.patch('/api/v1/car/1/status').set('authorization', `Bearer ${response.body.data.token}`)
// 			.end((err, res) => {
// 				res.should.have.status(401);
// 				expect(res.body.error).to.equal('Unauthorized Access!');
// 			});
// 			done();
// 			response.status.should.eql(200);
//     });
// 	});
// });
