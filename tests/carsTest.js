import chai, { expect } from 'chai';

import app from '../api/v1/index';

// testing the car ad endpoints
describe('Testing the car sale ads endpoints', () => {
	const car = {
		img_url: 'url link to new car image',
		owner_id: 2,
		year: 2001,
		state: 'Used',
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
				owner_id: 2,
				mileage: 3400,
				model: 'Camry R2',
			});
			done();
		});
	});
	// test for creating new car sale ad if the user is not registered
	it('should not allow an unregistered user to post a car sale ad', (done) => {
		car.owner_id = 6; // there is no user with id 3
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.equal('Unauthorized Access!');
			done();
		});
	});
	// test for viewing a specific car sale ad that is still available
	// this endpoint is usually for normal users
	it('should allow all users to view a car ad that is still available', (done) => {
		chai.request(app)
		.get('/api/v1/car/1')
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
	// this endpoint is usually for normal users
	it('should return all unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			data.map((c) => {
				expect(c).to.include({
					status: 'available',
				});
				return 0;
			});
			expect(data.length).to.equal(12);
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
			expect(data.length).to.equal(13); // 12 in the car model + 1 created in this test script
		});
		done();
	});
	it('should filter the list of unsold car ads based on a price range', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&min_price=20000000&max_price=30000000')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data[0]).to.include({ status: 'available' });
			expect(data[0].price).to.be.above(20000000);
			expect(data[0].price).to.be.below(30000000);
			expect(data.length).to.equal(5);
		});
		done();
	});
	it('should filter the list of unsold car ads based on the manufacturer', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&manufacturer=Mercedes-Benz')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(1);
			expect(data[0].manufacturer).to.equal('Mercedes-Benz');
		});
		done();
	});
	it('should filter the list of unsold car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&body_type=coupe')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(7);
			expect(data[0].body_type).to.equal('coupe');
		});
		done();
	});
	// this can only be done by an admin
	it('should filter the list of all car ads based on the body type', (done) => {
		chai.request(app)
		.get('/api/v1/car?body_type=coupe')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(7);
			expect(data[0].body_type).to.equal('coupe');
		});
		done();
	});
	it('should return all new unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&state=New')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(5);
			expect(data[0].state).to.equal('New');
		});
		done();
	});
	it('should return all used unsold car ads', (done) => {
		chai.request(app)
		.get('/api/v1/car?status=available&state=Used')
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data.length).to.equal(7); // 3 defined in the car model and 1 defined in this script
			expect(data[0].state).to.equal('Used');
		});
		done();
	});
	it('should delete a car sale ad if the user is an admin or the owner', (done) => {
		chai.request(app)
		.delete('/api/v1/car/3')
		.end((err, res) => {
			res.should.have.status(200);
			expect(res.body.data).to.equal('Car AD successfully deleted.');
		});
		done();
	});
	it('should update the price of the car sale ad if the user is the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/1/price').send({ user_id: 3, new_price: 20000000 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				price: 20000000,
				id: 1,
				owner_id: 3,
			});
		});
		done();
	});
	it('should mark the car sale ad as SOLD if the user is the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/4/status').send({ user_id: 3 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(201);
			expect(data).to.include({
				status: 'sold',
				id: 4,
				owner_id: 3,
			});
		});
		done();
	});
	it('should not update the car ad if the user is not the owner', (done) => {
		chai.request(app)
		.patch('/api/v1/car/1/status').send({ user_id: 1 })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(401);
			expect(data).to.equal('Unauthorized Access!');
		});
		done();
	});
});
