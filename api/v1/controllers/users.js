import bcrypt from 'bcrypt';

import users from '../models/users';
import util from '../util';

export default {
	// get list of all the users
	getAllUsers(req, res) {
		res.status(200)
		.send({ status: 200, data: users.getAllUsers() });
	},
	// create new user and add to database
	createNewUser(req, res) {
		let response = null;
		const saltRound = Math.floor(Math.random() * Math.floor(5) + 12);
		const {
			first_name, last_name, email,	password, is_admin,
			street,	city,	state, country,	phone, zip,
		} = req.body;
		if (first_name === undefined || last_name === undefined || password === undefined
			|| email === undefined || is_admin === undefined) {
			res.status(400).send({ status: 400, data: 'One of the main entries is not defined.' });
		}

		bcrypt.hash(password, saltRound, (err, hash) => {
			if (err) {
				res.status(500).send({ status: 500, data: 'Internal Server Error. 1' });
			}
			response = users.createNewUser({
				token: util.getToken(),
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
				registered_on: Date(),
			});
			if (response !== null) {
				res.status(201).send({ status: 201, data: response });
			} else {
				res.status(500).send({ status: 500, data: 'Internal Server Error. 2' });
			}
		});
	},
	// sign in a user if valid credentials are provided
	signinUser(req, res) {
		const { email, password } = req.body;
		const user = users.getAUserByEmail(email);

		if (user !== null) {
			bcrypt.compare(password, user.password, (err, result) => {
				if (result === true) {
					res.status(201).send({ status: 201, data: user });
				} else {
					res.status(200).send({ status: 200, data: 'Invalid Username or Password!' });
				}
			});
		} else {
			res.status(200).send({ status: 200, data: 'Invalid Username or Password!' });
		}
	},
};
