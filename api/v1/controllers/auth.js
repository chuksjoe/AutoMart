import bcrypt from 'bcrypt';

import users from '../models/users';
import util from '../utils';

export default {
	// get list of all the users
	getAllUsers(req, res) {
		return res.status(200).send({ status: 200, data: users.getAllUsers() });
	},
	// create new user and add to database
	createNewUser(req, res) {
		let response = null;
		const saltRound = Math.floor(Math.random() * Math.floor(5) + 2);
		const {
			first_name, last_name, email,	password, is_admin,
			street,	city,	state, country,	phone, zip,
		} = req.body;
		if (first_name === undefined || last_name === undefined || password === undefined
			|| email === undefined || is_admin === undefined) {
			return res.status(206).send({ status: 206, data: 'some of the main entries is not defined.' });
		}

		const usersList = users.getAllUsers();
		usersList.map((user) => {
			if (user.email === email) {
				return res.status(200).send({ status: 200, data: `a user with this e-mail (${email}) already exists.` });
			}
			return 0;
		});

		bcrypt.hash(password, saltRound, (err, hash) => {
			if (err) {
				return res.status(500).send({ status: 500, data: 'Something strange has happen, please refresh and then try again.' });
			}
			response = users.createNewUser({
				token: util.encodeToken(email),
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
				const data = Object.assign({}, response);
				delete data.password;
				return res.status(201).send({ status: 201, data });
			}
			return res.status(500).send({ status: 500, data: 'Something strange has happen, please refresh and then try again.' });
		});
		return 0;
	},
	// sign in a user if valid credentials are provided
	signinUser(req, res) {
		const { email, password } = req.body;
		const user = users.getAUserByEmail(email);

		if (user !== null) {
			bcrypt.compare(password, user.password, (err, result) => {
				if (result === true) {
					user.token = util.encodeToken(user.email, user.id);

					const data = Object.assign({}, user);
					delete data.password;
					return res.status(200).send({ status: 200, data });
				}
				return res.status(401).send({ status: 401, data: 'Invalid Username or Password!' });
			});
		} else {
			res.status(401).send({ status: 401, data: 'Invalid Username or Password!' });
		}
	},
};
