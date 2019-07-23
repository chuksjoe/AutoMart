import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import ApiError from './ApiError';
import db from '../db/index';
import queryText from '../db/queryText';

export default {
	validateToken(req, res, next) {
		try {
			if (!(req.headers && req.headers.authorization)) {
				throw new ApiError(401, 'Ensure you are logged in.');
			}
			const authorizationHeader = req.headers.authorization;
			if (!authorizationHeader) {
				throw new ApiError(401, 'Your token has expired. Please, re-login.');
			}
			const token = req.headers.authorization.split(' ')[1];
			const options = { expiresIn: '1d', issuer: 'automart'	};
			try {
				// add new property to the req object to hold the token that
				// will be used in the controller functions to verify users.
				req.token = jwt.verify(token, process.env.JWT_SECRET, options);
				next();
			}	catch (err) {
				const msg = err.message.charAt(0).toUpperCase() + err.message.slice(1);
				throw new ApiError(401, `${msg}. Please, re-login.`);
			}
		} catch (error) {
			res.status(error.statusCode)
			.send({ status: error.statusCode, error: error.message });
		}
		return 0;
	},
	validateAdmin1(req, res, next) {
		try {
			const { isAdmin } = req.token;
			if (!isAdmin) {
				throw new ApiError(401, 'Unauthorized Access. Reserved only for admins.');
			}
			next();
		} catch (error) {
			res.status(error.statusCode)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	validateAdmin2(isAdmin) {
		if (!isAdmin) {
			throw new ApiError(401, 'Unauthorized Access. Reserved only for admins.');
		}
	},
	validateOwner(isOwner) {
		if (!isOwner) {
			throw new ApiError(401, 'Unauthorized Access. Reserved only for resource owner.');
		}
	},
	validateOwnerOrAdmin(isOwnerOrAdmin) {
		if (!isOwnerOrAdmin) {
			throw new ApiError(401, 'Unauthorized Access. Reserved only for resource owner or an admin.');
		}
	},
	validateResource(isFound, resource) {
		if (!isFound) {
			throw new ApiError(404, `${resource} not found in database.`);
		}
	},
	validateResourceId(id, resource) {
		if (/\D/.test(id)) {
			throw new ApiError(400, `Invalid ${resource} ID.`);
		}
	},
	validateUserRegForm(req, res, next) {
		try {
			const errorFields = [];
			const {
				first_name, last_name, email, password, phone,
			} = req.body;
			if (first_name === undefined || first_name === '') errorFields.push('fname');
			if (last_name === undefined || last_name === '') errorFields.push('lname');
			if (email === undefined || email === '') errorFields.push('no-email');
			else if (!(/\S+@\S+\.\S+/.test(email))) {
				errorFields.push('bad-email');
			}
			if (password.length === undefined || password.length < 8) errorFields.push('short-pass');
			else if (password.search(/\d/) < 0) errorFields.push('no-digit-in-pass');
			else if (password.search(/[!@#$%^&*(),.?":{}|<>]/) < 0) errorFields.push('no-special-in-pass');
			if (phone	!== '') {
				if (phone.length < 10) errorFields.push('phone');
			}
			if (errorFields.length > 0) {
				throw new ApiError(206, 'Some required fields are not properly filled.');
			}
			next();
		} catch (error) {
			res.status(error.statusCode)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	async validateUserSignin(req, res, next) {
		try {
			const { email, password } = req.body;
			if (email === undefined || email === '') {
				throw new ApiError(206, 'email field cannot be empty.');
			}
			if (password === undefined || password === '') {
				throw new ApiError(206, 'password field cannot be empty.');
			}
			const { rows } = await db.query(queryText.getUserByEmail, [email]);
			if (!rows[0]) {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
			const data = rows[0];
			const match = await bcrypt.compare(password, data.password);
			if (!match) {
				throw new ApiError(401, 'Invalid Username or Password!');
			}
			delete data.password;
			req.data = data;
			next();
		} catch (error) {
			res.status(error.statusCode || 500)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	async validatePasswordReset(req, res, next) {
		try {
			const { email } = req.params;
			const { password, new_password } = req.body;
			let new_pass = null;

			if (password && (new_password === undefined || new_password === '')) {
				throw new ApiError(206, 'new password cannot be empty');
			}
			const { rows } = await db.query(queryText.getUserByEmail, [email]);
			if (!rows[0]) {
				throw new ApiError(404, `User with the email ${email} does not exist.`);
			}
			if (password === undefined && new_password === undefined) {
				new_pass = Math.random().toString(36).slice(-10);
			} else {
				const match = await bcrypt.compare(password, rows[0].password);
				if (!match) {
					throw new ApiError(400, 'Incorrect password!');
				}
				new_pass = new_password;
			}
			req.params.new_pass = new_pass;
			next();
		} catch (error) {
			res.status(error.statusCode || 500)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	validatePhoneNo(phoneNo) {
		if (phoneNo && (/\D/.test(phoneNo) || phoneNo.length < 10)) {
			throw new ApiError(400, 'Your phone number is badly formed.');
		}
	},

	validateNewPostForm: (req, res, next) => {
		try {
			const errorFields = [];
			const {
				manufacturer, model, body_type, price, state,
			} = req.body;
			if (manufacturer === undefined || manufacturer === '') {
				errorFields.push('manufacturer');
			}
			if (model === undefined || model === '') errorFields.push('model');
			if (body_type === undefined || body_type === '') {
				errorFields.push('body_type');
			}
			if (price === undefined || price === '') errorFields.push('price');
			if (state === undefined || state === '') errorFields.push('state');
			if (errorFields.length > 0) {
				throw new ApiError(206, 'Some required fields are not properly filled.');
			}
			next();
		} catch (error) {
			res.status(error.statusCode)
			.send({ status: error.statusCode, error: error.message });
		}
	},
	validateCarStatus(isSold) {
		if (isSold) {
			throw new ApiError(400, 'Car already sold.');
		}
	},
	validatePrice(price) {
		if (price === undefined || price === '') {
			throw new ApiError(400, 'The price offered cannot be null.');
		}
	},
	validateStatus(isPending, resource) {
		if (isPending) {
			throw new ApiError(400, `You have a Pending ${resource} on this car Ad.`);
		}
	},
	validateOwnership(isOwner, action) {
		if (isOwner) {
			throw new ApiError(400, `You can't place a ${action} on your car ad.`);
		}
	},
	validateAvailability(isPending) {
		if (!isPending) {
			throw new ApiError(400, 'The offer is not available.');
		}
	},
	validateNewFlagForm: (req, res, next) => {
		try {
			const { reason, description, car_id } = req.body;
			if (car_id === undefined || car_id === '') {
				throw new ApiError(206, 'The car ID is required');
			}
			if (reason === '' || description === '' || reason === undefined || description === undefined) {
				throw new ApiError(206, 'Reason and Description cannot be null.');
			}
			next();
		} catch (error) {
			res.status(error.statusCode)
			.send({ status: error.statusCode, error: error.message });
		}
	},
};
