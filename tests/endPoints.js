import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';

import app from '../api/v1/index';
import util from '../api/v1/util';

chai.use(chaiHttp);
chai.should();
// testing to ensure the server is running
describe('Server', () => {
	it(`it should test that server is running on port ${config.get('port')}`, () => {
		app.port.should.be.eql(config.get('port'));
	});

	it('it should send a message on default', () => {
		chai.request(app)
		.get('/')
		.end((err, res) => {
			expect(res.status).to.equal(200);
			expect(res.body.message).to.equal('Welcome on Board: AutoMart API.');
			expect(res.body).to.be.an.instanceof(Object);
		});
	});
});

// testing the user sign up and sign in endpoints
describe('Testing User endpoints', () => {
	const user = {
		first_name: 'ChuksJoe',
		last_name: 'Orjiakor',
		email: 'chuksjoe@live.com',
		password: 'testing',
		is_admin: false,
		address: {
			street: '15 Aborishade road, Lawanson',
			city: 'Surulere',
			state: 'Lagos',
			country: 'Nigeria',
		},
		phone: '08131172617',
		zip: '234-001',
	};
	it('It should create new user account when valid entries are supplied', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signup').set('Accept', 'application/json').send(user)
		.end((err, res) => {
      expect(res).to.have.status(201);
      expect(res.body.data).to.include({
        id: res.body.data.id,
        token: res.body.data.token,
        email: user.email,
        first_name: user.first_name,
      });
      done();
    });
	});
	it('It should not create new user account if any of the required entries are not supplied', (done) => {
		// required entries: first_name, last_name, email, password, is_admin
		user.first_name = undefined;
		user.email = undefined;
		chai.request(app)
		.post('/api/v1/auth/signup').set('Accept', 'application/json').send(user)
		.end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.data).to.include('One of the main entries is not defined.');
      done();
    });
	});
	it('it should allow a user to sign into their account if they supply valid credentials', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
		.end((err, res) => {
			res.should.have.status(201);
			const { data } = res.body;
			expect(data).to.include({
          id: data.id,
          token: data.token,
          email: 'chuksjoe@live.com',
          first_name: 'ChuksJoe',
        });
			done();
		});
	});
	it('it should not allow a user to sign in if they supply invalid credentials', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'wrongpassword' })
		.end((err, res) => {
			res.should.have.status(200);
			expect(res.body.data).to.include('Invalid Username or Password!');
			done();
		});
	});
});

// testing the car ad endpoints
describe('Testing the car ads endpoints', () => {
	const car = {
		img_url: 'url link to new car image',
		owner_id: 1,
		year: 2001,
		state: 'used',
		status: 'available',
		price: 1500000.20,
		manufacturer: 'mercedes-benz',
		model: 'L-Class L34',
		body_type: 'coupe',
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
	it('it should allow a valid user to create a car sale ad', (done) => {
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			res.should.have.status(201);
			const { data } = res.body;
			expect(data).to.include({
				id: data.id,
				name: data.name,
				owner_id: 1,
				mileage: 3400,
				model: 'L-Class L34',
			});
			done();
		});
	});
	it('it should not allow an unregistered user to post a car sale ad', (done) => {
		car.owner_id = 3; // there is no user with id 3
		chai.request(app)
		.post('/api/v1/car').set('Accept', 'application/json').send(car)
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.data).to.include('Unauthorized Access!');
			done();
		});
	});
});
