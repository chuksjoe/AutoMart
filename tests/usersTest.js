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
		password: 'testing@123',
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
	it('should not create new user account if email supplied is already used by another user', (done) => {
		user.email = 'chuksjoe@live.com';
		chai.request(app)
		.post('/api/v1/auth/signup').set('Accept', 'application/json').send(user)
		.end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.error).to.equal(`A user with this e-mail (${user.email}) already exists.`);
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
	it('should not allow a user to sign in if they supply invalid password', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'wrongpassword' })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Invalid Username or Password!');
			done();
		});
	});
	it('should not allow a user to sign in if they supply invalid email', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chukswho@live.com', password: 'wrongpassword' })
		.end((err, res) => {
			res.should.have.status(401);
			expect(res.body.error).to.equal('Invalid Username or Password!');
			done();
		});
	});
	it('should return list of all registered users if the user is an admin', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'chuksjoe@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/user').set('authorization', `Bearer ${response.body.data.token}`)
			.end((err, res) => {
				const { data } = res.body;
				res.should.have.status(200);
				expect(data.length).to.equal(4);
				expect(data[0]).to.include({
					id: 1,
					first_name: 'ChuksJoe',
					last_name: 'Orjiakor',
				});
				done();
			});
      response.status.should.eql(200);
    });
	});
	it('should not return list of all registered users if the user is not an admin', (done) => {
		chai.request(app)
		.post('/api/v1/auth/signin').type('form').send({ email: 'tolu@live.com', password: 'testing' })
    .end((error, response) => {
			chai.request(app)
			.get('/api/v1/user').set('authorization', `Bearer ${response.body.data.token}`)
			.end((err, res) => {
				res.should.have.status(401);
				expect(res.body.error).to.equal('Unauthorized Access!');
				done();
			});
      response.status.should.eql(200);
    });
	});
});
