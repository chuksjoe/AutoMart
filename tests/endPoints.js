import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
import app from '../api/v1/index';

chai.use(chaiHttp);
const should = chai.should();

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
