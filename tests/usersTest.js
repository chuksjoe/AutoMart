import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../api/v1/index';

require('dotenv').config();
require('custom-env').env(true);

chai.use(chaiHttp);
chai.should();
// testing to ensure the server is running
describe('Check Server', () => {
	it(`should test that server is running on port ${process.env.PORT}`, () => {
		app.port.should.be.eql(parseInt(process.env.PORT, 10));
	});
});

// testing the user sign up and sign in endpoints
describe('Testing User endpoints', () => {
	const user = {
		first_name: 'Douglas',
		last_name: 'Ejiofor',
		email: 'doug@live.com',
		password: 'testing123',
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
	it('should create new user account when valid entries are supplied', (done) => {
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
	it('should not create new user account if any of the required entries are not supplied', (done) => {
		// required entries: first_name, last_name, email, password, is_admin
		user.first_name = '';
		user.email = '';
		chai.request(app)
		.post('/api/v1/auth/signup').set('Accept', 'application/json').send(user)
		.end((err, res) => {
      expect(res).to.have.status(206);
      expect(res.body.error).to.equal('Some required fields are not filled.');
      done();
    });
	});
	it('should allow a user to sign into their account if they supply valid credentials', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
		.end((err, res) => {
			const { data } = res.body;
			res.should.have.status(200);
			expect(data).to.include({
        id: data.id,
        token: data.token,
        email: 'chuksjoe@live.com',
        first_name: 'ChuksJoe',
      });
			done();
		});
	});
	it('should not allow a user to sign in if they supply invalid credentials', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'wrongpassword' })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Invalid Username or Password!');
			done();
		});
	});
});
