import express from 'express';
import logger from 'morgan';
import cors from 'cors';

import serveUI from './serveUI';
import routes from './routes';

require('dotenv').config();
require('custom-env').env(true);
const debug = require('debug')('http');

const app = express();
const port = process.env.PORT;
const prefix = '/api/v1';

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
app.options('*', cors());

/*
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  next();
});
*/

// serve the api endpoints built in routes folder
routes(app, prefix);

// serve the UI pages with their resources
serveUI(app, prefix);

const listen = app.listen(port || 5000, () => {
	debug(
		`AutoMart Server is running on port ${port} and in ${
			process.env.MODE
		} mode...`,
	);
});

// for testing
module.exports = app;
module.exports.port = listen.address().port;
