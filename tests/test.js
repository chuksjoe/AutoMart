import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
import server from '../api/v1/index';

chai.use(chaiHttp);
const should = chai.should();

describe('Server', () => {
	it(`it should test that server is running on port ${config.get('port')}`, () => {
		server.port.should.be.eql(config.get('port'));
	});

	it('it should send a message on default', () => {
		chai.request(server)
		.get('*')
		.end((err, res) => {
			res.should.have.status(202);
			res.should.have.message('Welcome on Board: AutoMart API.');
			res.body.should.be.a('integer');
		});
	});
});
