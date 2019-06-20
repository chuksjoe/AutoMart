import { Pool } from 'pg';

require('dotenv').config();
require('custom-env').env(true);

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export default {
	query(text, params) {
		return new Promise((resolve, reject) => {
			pool.query(text, params)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			});
		});
	},
};
