import bcrypt from 'bcrypt';
import 'babel-polyfill';
import uuidv4 from 'uuidv4';
import moment from 'moment';

import users from '../models/users';
import util from '../helpers/utils';
import ApiError from '../helpers/ApiError';
import db from '../db/index';

export default {
	// get list of all the users
	getAllUsers(req, res) {
		const { payload } = req;
		if (payload.admin) {
			res.status(200).send({ status: 200, data: users.getAllUsers() });
		} else {
			res.status(401).send({ status: 401, error: 'Unauthorized Access!' });
		}
	},
	// create new user and add to database
	async createNewUser(req, res) {
		const queryText = `INSERT INTO
		users (id, email, password, first_name, last_name, is_admin, street, city, state,
		country, phone, zip, registered_on, num_of_ads, num_of_orders)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;
		const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);

		try {
			const {
				first_name, last_name, email,	password, is_admin,
				street,	city,	state, country,	phone, zip,
			} = req.body;
			if (util.validateUserRegForm(req.body).length > 0) {
				throw new ApiError(206, 'Some required fields are not properly filled.');
			}
			const pass = util.hashPassword(password, saltRound);
			const values = [uuidv4(), email, pass, first_name, last_name, is_admin, street, city,
			state, country, phone, zip, moment(), 0, 0];

			const { rows } = await db.query(queryText, values);
			const token = util.encodeToken(rows[0].email, rows[0].id, rows[0].is_admin);
			const response = rows[0];

			delete response.pass;
			response.token = token;

			res.status(201).send({ status: 201, data: response });
		} catch (err) {
			if (err.routine === '_bt_check_unique') {
				return res.status(400)
				.send({ status: 400, error: `A user with this e-mail (${req.body.email}) already exists.` });
			}
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
		return 0;
	},
	// sign in a user if valid credentials are provided
	async signinUser(req, res) {
		const { email, password } = req.body;
		const user = users.getAUserByEmail(email);
		try {
			if (user === null) {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
			const match = await bcrypt.compare(password, user.password);
			if (match) {
				const data = Object.assign({}, user);
				delete data.password;
				data.token = util.encodeToken(data.email, data.id, data.is_admin);
				res.status(200).send({ status: 200, data });
			} else {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
		} catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
