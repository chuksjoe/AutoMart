import chai, { expect } from 'chai';

import app from '../api/v1/index';

// testing the car ad endpoints
describe('Testing the car sale ads endpoints', () => {
	const car = {
		img_url: 'url link to new car image',
		owner_id: 1,
		year: 2001,
		state: 'used',
		status: 'available',
		price: 5500000.20,
		manufacturer: 'Toyota',
		model: 'Camry R2',
		body_type: 'hatch',
		fuel_type: 'petrol',
		mileage: 3400,
		color: 'yellow',
		transmission_type: 'automatic',
		description: 'other info about the car will go here.',
		features: {
			ac: true,
			arm_rest: true,
			air_bag: true,
			dvd_player: false,
			fm_radio: true,
			tinted_windows: false,
		},
	};
	// test for creating new car sale ad if the user is registered
	it('should allow a valid user to create a car sale ad', (done) => {
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				id: data.id,
				name: data.name,
				owner_id: 1,
				mileage: 3400,
				model: 'Camry R2',
			});
			done();
		});
	});
	// test for creating new car sale ad if the user is not registered
	it('should not allow an unregistered user to post a car sale ad', (done) => {
		car.owner_id = 4; // there is no user with id 3
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
			done();
		});
	});
	// test for viewing a specific car sale ad that is still available
	// car with id = 1 is available, and user with id = 3 does not exist
	it('should allow all users to view a car ad that is still available', (done) => {
		chai.request(app)
		.get('/api/v1/car/1').send({ user_id: 3 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data).to.include({
				id: data.id,
				name: data.name,
				price: data.price,
			});
			done();
		});
	});
	// car with id = 2 is sold, user with id = 3 does not exist
	it('should not allow a user who is not the owner of a car and is not an admin to view sold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car/2').send({ user_id: 3 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
			done();
		});
	});
	// car with id = 2 is sold, user with id = 1 is an admin
	it('should allow a user who is either an admin or the owner to view a sold car ad', (done) => {
		chai.request(app)
		.get('/api/v1/car/2').send({ user_id: 1 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data).to.include({
				id: data.id,
				name: data.name,
				price: data.price,
			});
			done();
		});
	});
	// user with id = 2 is is not an admin
	// Note: there is no need including 'status=available&' to the url since a user
	// who is not an admin cannot view SOLD car ads
	it('should return all unsold car ads if the user is not an admin', (done) => {
		chai.request(app)
		.get('/api/v1/car').send({ user_id: 2 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data[0]).to.include({
				status: 'available',
			});
			done();
		});
	});
	// user with id = 1 is defined and is an admin
	it('should return all car ads if the user is an admin', (done) => {
		chai.request(app)
		.get('/api/v1/car').send({ user_id: 1 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(6); // 5 in the car model + 1 created in this test script
		});
		done();
	});
	// for a user you need not enter query for the car ad status,
	// because, its only the unsold ads they have access to on the main view
	it('should filter the list of unsold car ads based on a price range', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&min_price=1500000&max_price=5000000').send({ user_id: 2 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data[0]).to.include({ status: 'available' });
			expect(data[0].price).to.be.above(1500000);
			expect(data[0].price).to.be.below(5000000);
			expect(data.length).to.equal(2);
		});
		done();
	});
	// in this case, a user is not defined
	it('should filter the list of unsold car ads based on the manufacturer', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&manufacturer=mercedes-benz')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(2);
			expect(data[0].manufacturer).to.equal('mercedes-benz');
		});
		done();
	});
	it('should filter the list of unsold car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&body_type=coupe')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3);
			expect(data[0].body_type).to.equal('coupe');
		});
		done();
	});
	// this can only be done by an admin
	it('should filter the list of all car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?body_type=coupe').send({ user_id: 1 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(4);
			expect(data[0].body_type).to.equal('coupe');
		});
		done();
	});
	it('should return all new unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&state=new')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(2);
			expect(data[0].state).to.equal('new');
		});
		done();
	});
	it('should return all used unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&state=used')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(3); // 3 defined in the car model and 1 defined in this script
			expect(data[0].state).to.equal('used');
		});
		done();
	});
	it('should delete a car sale ad if the user is an admin or the owner', (done) => {
		chai.request(app)
		.delete('/api/v1/car/3').send({ user_id: 1 })
		.end((err, res) => {
			res.should.have.status(200);
			expect(res.body.data).to.equal('Car AD successfully deleted.');
		});
		done();
	});
	it('should not delete a car sale ad if the user is not an admin or the owner', (done) => {
		chai.request(app)
		.delete('/api/v1/car/2').send({ user_id: 2 })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
		});
		done();
	});
	it('should update the price of the car sale ad if the user is the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/1/price').send({ user_id: 1, new_price: 2000000 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				price: 2000000,
				id: 1,
				owner_id: 1,
			});
		});
		done();
	});
	it('should mark the car sale ad as SOLD if the user is the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/4/status').send({ user_id: 1 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				status: 'sold',
				id: 4,
				owner_id: 1,
			});
		});
		done();
	});
	it('should not update the car ad if the user is not the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/1/status').send({ user_id: 2 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(401);
			expect(data).to.equal('Unauthorized Access!');
		});
		done();
	});
});