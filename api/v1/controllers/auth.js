import 'babel-polyfill';
import bcrypt from 'bcrypt';
import moment from 'moment';

// import users from '../models/users';
import utils from '../helpers/utils';
import validator from '../helpers/validators';
import sendEmails from '../helpers/sendEmails';
import db from '../db/index';
import queryText from '../db/queryText';

export default {
	// create new user and add to database
	async createNewUser(req, res) {
		try {
			const {
				first_name, last_name, email,	password, is_admin,
				street,	city,	state, country,	phone, zip,
			} = req.body;
			const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);
			const pass = bcrypt.hashSync(password, saltRound);
			const values = [email, pass, first_name, last_name, is_admin, street, city,
			state, country, phone, zip, moment(), 0, 0];

			const { rows } = await db.query(queryText.createUser, values);
			const token = utils.encodeToken(rows[0].email, rows[0].id, rows[0].is_admin);
			const data = rows[0];

			delete data.password;
			data.token = token;
			req.data = data;
			sendEmails.sendSignupMessage({ email, first_name, last_name });

			res.status(201).send({ status: 201, data });
		} catch (err) {
			if (err.routine === '_bt_check_unique') {
				res.status(400)
				.send({ status: 400, error: `A user with this e-mail (${req.body.email}) already exists.` });
			} else {
				res.status(err.statusCode || 500)
				.send({ status: err.statusCode, error: err.message });
			}
		}
	},
	// sign in a user if valid credentials are provided
	async signinUser(req, res) {
		try {
			const { id, email, is_admin } = req.data;
			await db.query(queryText.updateUserOnSignin, [moment(), email]);
			req.data.token = utils.encodeToken(email, id, is_admin);
			res.status(200).send({ status: 200, data: req.data });
		} catch (error) {
			res.status(error.statusCode || 500)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	// get list of all the users
	async getAllUsers(req, res) {
		try {
			const { rows } = await db.query(queryText.getAllUsers, []);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get a specific user info
	async getAUser(req, res) {
		try {
			const { user_id } = req.params;
			validator.validateResourceId(user_id, 'User');
			const { rows } = await db.query(queryText.getUserById, [user_id]);
			validator.validateResource(rows[0], 'User');
			const data = rows[0];
			delete data.password;
			res.status(200).send({ status: 200, data });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// password reset fuctionality
	async resetPassword(req, res) {
		try {
			const { email, new_pass } = req.params;
			const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);
			const hashedPass = await bcrypt.hashSync(new_pass, saltRound);
			const response = await db.query(queryText.updateUserPassword, [hashedPass, moment(), email]);
			const { first_name, last_name } = response.rows[0];
			sendEmails.sendPasswordResetMessage({
				email, first_name, last_name, new_pass,
			});
			res.status(204)
			.send({
				status: 204,
				data: 'You have successfully reset your password, and the new password has been sent to your email.',
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	async updateUserDetails(req, res) {
		try {
			const { email } = req.params;
			let response;
			if (req.body.is_admin) {
				validator.validateAdmin2(req.token.isAdmin);
			}
			validator.validateOwnerOrAdmin(req.token.isAdmin || req.token.email === email);
			validator.validatePhoneNo(req.body.phone);
			response = await db.query(queryText.getUserByEmail, [email]);
			validator.validateResource(response.rows[0], 'User');
			const {
				street, city, state, country, phone, zip, is_admin,
			} = response.rows[0];
			const values = [req.body.street || street, req.body.city || city, req.body.state || state,
			req.body.country || country, req.body.phone || phone, req.body.zip || zip,
			req.body.is_admin || is_admin, moment(), email];

			response = await db.query(queryText.updateUserInfo, values);
			const data = response.rows[0];
			delete data.password;
			res.status(200).send({ status: 200, data });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	async deleteUser(req, res) {
		try {
			const { email } = req.params;
			validator.validateOwnerOrAdmin(req.token.isAdmin || req.token.email === email);
			const { rows } = await db.query(queryText.getUserByEmail, [email]);
			validator.validateResource(rows[0], 'User');
			const { first_name, last_name } = rows[0];
			await db.query(queryText.deleteUser, [email]);
			res.status(200).json({
				status: 200,
				data: `User (${first_name} ${last_name}) successfully deleted.`,
				message: `You have successfully deleted ${first_name} ${last_name} and all data related to him/her from AutoMart database.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
