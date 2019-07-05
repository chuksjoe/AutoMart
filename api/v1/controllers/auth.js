import bcrypt from 'bcrypt';
import 'babel-polyfill';
import moment from 'moment';

// import users from '../models/users';
import utils from '../helpers/utils';
import ApiError from '../helpers/ApiError';
import db from '../db/index';

export default {
	// get list of all the users
	async getAllUsers(req, res) {
		const { payload } = req;
		const queryText = 'SELECT * FROM users ORDER BY registered_on DESC';
		try {
			if (!payload.admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const { rows } = await db.query(queryText, []);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get a specific user info
	async getAUser(req, res) {
		const queryText = 'SELECT * FROM users WHERE id = $1';
		const { user_id } = req.params;
		try {
			const { rows } = await db.query(queryText, [user_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'User does not exist');
			}
			const data = rows[0];
			delete data.password;
			res.status(200).send({ status: 200, data });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// create new user and add to database
	async createNewUser(req, res) {
		const queryText = `INSERT INTO
		users (email, password, first_name, last_name, is_admin, street, city, state,
		country, phone, zip, registered_on, num_of_ads, num_of_orders)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
		const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);

		try {
			const {
				first_name, last_name, email,	password, is_admin,
				street,	city,	state, country,	phone, zip,
			} = req.body;
			if (utils.validateUserRegForm(req.body).length > 0) {
				throw new ApiError(206, 'Some required fields are not properly filled.');
			}
			const pass = utils.hashPassword(password, saltRound);
			const values = [email, pass, first_name, last_name, is_admin, street, city,
			state, country, phone, zip, moment(), 0, 0];

			const { rows } = await db.query(queryText, values);
			const token = utils.encodeToken(rows[0].email, rows[0].id, rows[0].is_admin);
			const data = rows[0];

			delete data.pass;
			data.token = token;

			res.status(201).send({ status: 201, data });
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
		const queryText1 = 'SELECT * FROM users WHERE email = $1';
		const queryText2 = 'UPDATE users SET last_online = $1 WHERE email = $2';
		try {
			const { rows } = await db.query(queryText1, [email]);
			if (!rows[0]) {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
			const data = rows[0];
			const match = await bcrypt.compare(password, data.password);
			if (!match) {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
			await db.query(queryText2, [moment(), email]);
			delete data.password;
			data.token = utils.encodeToken(data.email, data.id, data.is_admin);
			res.status(200).send({ status: 200, data });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// password reset fuctionality
	async resetPassword(req, res) {
		const { email } = req.params;
		const { password, new_password } = req.body;
		const queryText1 = 'SELECT password FROM users WHERE email = $1';
		const queryText2 = 'UPDATE users SET password = $1, last_modified = $2 WHERE email = $3 RETURNING first_name, last_name';
		const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);
		let new_pass = null;

		try {
			const { rows } = await db.query(queryText1, [email]);
			if (!rows[0]) {
				throw new ApiError(404, `User with the email ${email} does not exist.`);
			}
			if (password === undefined && new_password === undefined) {
				new_pass = Math.random().toString(36).slice(-10);
			} else {
				const match = await bcrypt.compare(password, rows[0].password);
				if (!match) {
					throw new ApiError(206, 'Incorrect password!');
				}
				new_pass = new_password;
			}
			const hashed_pass = utils.hashPassword(new_pass, saltRound);
			const response = await db.query(queryText2, [hashed_pass, moment(), email]);
			const { first_name, last_name } = response.rows[0];
			res.status(204)
			.send({
				status: 204,
				data: 'You have successfully reset your password, and the new password has been sent to your email.',
			});

			const mailOption = {
				from: '"AutoMart Help" <automart.help@gmail.com>',
				to: email,
				subject: 'AutoMart Password Reset',
				html: `<h3>AutoMart Password Reset Successful!</h3>
				<p>Hi ${first_name} ${last_name}, you have successfully reset your password.</p>
				<p>Your new password is: ${new_pass}</p>
				<p>Note: if the password is auto-generated, you can reset it to your desired password by changing the password in your profile.</p>`,
			};
			utils.sendMail(mailOption);
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	async updateUserDetails(req, res) {
		const queryText1 = 'SELECT * FROM users WHERE email = $1';
		const queryText2 = `UPDATE users SET street = $1, city = $2, state = $3, country = $4,
						phone = $5, zip = $6, is_admin = $7, last_modified = $8 WHERE email = $9 RETURNING *`;
		const { email } = req.params;
		try {
			if (req.body.is_admin && !req.payload.admin) {
				throw new ApiError(401, 'Unauthorized Access! Reserved for admins only');
			}
			let response = await db.query(queryText1, [email]);
			if (!response.rows[0]) {
				throw new ApiError(404, `User with the email ${email} does not exist.`);
			}
			const {
				id, street, city, state, country, phone, zip, is_admin,
			} = response.rows[0];
			if (!req.payload.admin && req.payload.id !== id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			if (req.body.phone && (/\D/.test(req.body.phone) || req.body.phone.length < 10)) {
				throw new ApiError(400, 'Your phone number is badly formed.');
			}
			const values = [req.body.street || street, req.body.city || city, req.body.state || state,
			req.body.country || country, req.body.phone || phone, req.body.zip || zip,
			req.body.is_admin || is_admin, moment(), email];

			response = await db.query(queryText2, values);
			const data = response.rows[0];
			delete data.password;
			res.status(200).send({ status: 200, data });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
