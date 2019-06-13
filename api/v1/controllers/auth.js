import bcrypt from 'bcrypt';
import 'babel-polyfill';

import users from '../models/users';
import util from '../helpers/utils';
import ApiError from '../helpers/ApiError';

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
		try {
			let response = null;
			const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);
			const {
				first_name, last_name, email,	password, is_admin,
				street,	city,	state, country,	phone, zip,
			} = req.body;
			if (util.validateUserRegForm(req.body).length > 0) {
				throw new ApiError(206, 'Some required fields are not filled.');
			}
			const usersList = users.getAllUsers();
			usersList.map((user) => {
				if (user.email === email) {
					throw new ApiError(200, `A user with this e-mail (${email}) already exists.`);
				}
				return 0;
			});

			await bcrypt.hash(password, saltRound, (err, hash) => {
				if (err) {
					throw new ApiError(500, 'Something strange has happened, please refresh and then try again.');
				}
				response = users.createNewUser({
					first_name,
					last_name,
					email,
					password: hash,
					is_admin: is_admin === 'true',
					address: {
						street,
						city,
						state,
						country,
					},
					phone,
					zip,
					registered_on: util.getDate(),
					last_online: null,
					num_of_ads: 0,
					num_of_orders: 0,
				});
				if (response !== null) {
					const data = Object.assign({}, response);
					delete data.password;
					data.token = util.encodeToken(data.email, data.id, data.is_admin);
					res.status(201).send({ status: 201, data });
				} else {
					res.status(500)
					.send({ status: 500, error: 'Something strange has happened, please refresh and then try again.' });
				}
			});
		} catch (err) {
			res.status(err.statusCode)
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
