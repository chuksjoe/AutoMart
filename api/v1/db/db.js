const { Pool } = require('pg');
require('dotenv').config();
require('custom-env').env(true);
const debug = require('debug')('http');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
	debug('Connected to Auto Mart database');
});

async function runQuery(text) {
	await pool.query(text)
	.then((res) => {
		debug(res);
		pool.end();
	})
	.catch((err) => {
		debug(err);
		pool.end();
	});
}

const createUsersTable = () => {
	const queryText = `CREATE TABLE IF NOT EXISTS users(
		id UUID PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		is_admin BOOLEAN NOT NULL,
		street TEXT,
		city TEXT,
		state TEXT,
		country TEXT,
		phone TEXT,
		zip TEXT,
		registered_on TIMESTAMPTZ,
		last_online TIMESTAMPTZ NULL,
		last_modified TIMESTAMPTZ NULL,
		num_of_ads SMALLINT,
		num_of_orders SMALLINT
	)`;
	runQuery(queryText);
};

const createCarsTable = () => {
	const queryText = `CREATE TABLE IF NOT EXISTS cars(
		id UUID PRIMARY KEY,
		name TEXT NOT NULL,
		img_url TEXT NOT NULL,
		owner_id UUID NOT NULL,
		owner_name TEXT NOT NULL,
		email TEXT NOT NULL,
		created_on TIMESTAMPTZ NOT NULL,
		last_modified TIMESTAMPTZ,
		year SMALLINT NOT NULL,
		state VARCHAR(5) NOT NULL,
		status VARCHAR(10) NOT NULL,
		price NUMERIC(15,2) NOT NULL,
		manufacturer TEXT NOT NULL,
		model TEXT NOT NULL,
		body_type TEXT NOT NULL,
		fuel_type TEXT NOT NULL,
		doors SMALLINT NOT NULL,
		fuel_cap SMALLINT NOT NULL,
		mileage INTEGER NOT NULL,
		color TEXT NOT NULL,
		transmission_type TEXT NOT NULL,
		description TEXT,
		ac BOOLEAN,
		arm_rest BOOLEAN,
		air_bag BOOLEAN,
		dvd_player BOOLEAN,
		fm_radio BOOLEAN,
		tinted_windows BOOLEAN,
		FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
	)`;
	runQuery(queryText);
};

const createOrdersTable = () => {
	const queryText = `CREATE TABLE IF NOT EXISTS orders(
		id UUID PRIMARY KEY,
		car_id UUID NOT NULL,
		car_name TEXT NOT NULL,
		car_body_type TEXT NOT NULL,
		price NUMERIC(15,2),
		owner_id UUID NOT NULL,
		owner_name TEXT,
		buyer_id UUID NOT NULL,
		buyer_name TEXT,
		price_offered NUMERIC(15,2),
		status TEXT,
		created_on TIMESTAMPTZ,
		last_modified TIMESTAMPTZ,
		FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE
	)`;
	runQuery(queryText);
};

const dropUsersTable = () => {
	runQuery('DROP TABLE IF EXISTS users');
};

const dropCarsTable = () => {
	runQuery('DROP TABLE IF EXISTS cars');
};

const dropOrdersTable = () => {
	runQuery('DROP TABLE IF EXISTS orders');
};

const truncUsersTable = () => {
	runQuery('DELETE FROM users');
};

pool.on('remove', () => {
	debug('client removed.');
	process.exit(0);
});

module.exports = {
	createUsersTable,
	createCarsTable,
	createOrdersTable,
	dropUsersTable,
	dropCarsTable,
	dropOrdersTable,
	truncUsersTable,
};

require('make-runnable');
