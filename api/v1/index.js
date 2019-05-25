import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';

import router from './server';

const debug = require('debug')('server:debug');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = config.get('port');

app.use('/api/v1', router);
app.get('*', (req, res) => res.status(200).send({ message: 'Welcome on Board: AutoMart API.' }));

const listen = app.listen(port, () => {
	debug(`AutoMart Server is running on port ${port} and in ${config.get('mode')} mode...`);
	console.log(`AutoMart Server is running on port ${port} and in ${config.get('mode')} mode...`);
});

// for testing
module.exports = app;
module.exports.port = listen.address().port;