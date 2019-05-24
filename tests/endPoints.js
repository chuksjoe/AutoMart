import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';

import app from '../api/v1/index';
import util from '../api/v1/util';

chai.use(chaiHttp);
const should = chai.should();
const prePath = config.get('path');

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

describe('Testing User endpoints', () => {
	it('It should create new user account when valid entries are supplied', () => {
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
		chai.request(app)
			.post(`${prePath}/api/v1/auth/signup`).set('Accept', 'application/json').send(user)
			.end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.data).to.include({
          id: 1,
          token: res.body.data.token,
          email: user.email,
          first_name: user.first_name,
        });
        done();
      });
	});
	it('It should not create new user account if any of the required entries are not supplied', () => {
		// required entries: first_name, last_name, email, password, is_admin
		const user = {
			// first_name: 'ChuksJoe',
			last_name: 'Orjiakor',
			// email: 'chuksjoe@live.com',
			password: 'testing',
			is_admin: true,
			address: {
				street: '15 Aborishade road, Lawanson',
				city: 'Surulere',
				state: 'Lagos',
				country: 'Nigeria',
			},
			phone: '08131172617',
			zip: '234-001',
		};
		chai.request(app)
			.post(`${prePath}/api/v1/auth/signup`).set('Accept', 'application/json').send(user)
			.end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.data).to.include({
          message: 'One of the main entries is not defined.',
        });
        done();
      });
	});
});
