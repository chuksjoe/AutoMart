import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import ApiError from './ApiError';

require('dotenv').config();
require('custom-env').env(true);
const debug = require('debug')('http');

// utility functions
const appendLeadZero = val => (Number(val) > 10 ? val : `0${val}`);

module.exports = {
	getDate: () => {
		const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
		const months = ['Jan', 'Feb', 'Mar', 'April', 'May',
		'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		const date = new Date();
		const time = date.toLocaleString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
		return `${days[date.getDay()]},
		 ${appendLeadZero(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}, ${time}`;
	},

	hashPassword: (password, saltRound) => bcrypt.hashSync(password, saltRound),

	encodeToken: (email, id, admin) => {
		const payload = { email, id, admin };
		const option = { expiresIn: '1d', issuer: 'automart' };
		const secret = process.env.JWT_SECRET;
		return jwt.sign(payload, secret, option);
	},

	validateToken: (req, res, next) => {
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
				// add new property to the req object to hold the payload that
				// will be used in the controller functions to verify users.
				req.payload = jwt.verify(token, process.env.JWT_SECRET, options);
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

	validateUserRegForm: (req_body) => {
		const errorFields = [];
		const {
			first_name, last_name, email, password, phone,
		} = req_body;
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
		return errorFields;
	},

	validateNewPostForm: (req_body) => {
		const errorFields = [];
		if (req_body.image_url === undefined || req_body.image_url === '') {
			errorFields.push('image_url');
		}
		if (req_body.manufacturer === undefined || req_body.manufacturer === '') {
			errorFields.push('manufacturer');
		}
		if (req_body.model === undefined || req_body.model === '') errorFields.push('model');
		if (req_body.body_type === undefined || req_body.body_type === '') {
			errorFields.push('body_type');
		}
		if (req_body.price === undefined || req_body.price === '') errorFields.push('price');
		if (req_body.state === undefined || req_body.state === '') errorFields.push('state');

		return errorFields;
	},

	sendMail: (mailOption) => {
		try {
			const transport = nodemailer.createTransport({
				service: process.env.MAILER_SERVICE,
				auth: {
					user: process.env.MAILER_EMAIL,
					pass: process.env.MAILER_PASS,
				},
			});
			transport.sendMail(mailOption, (err, info) => {
				if (err) debug(err);
				else debug(info);
			});
		} catch (err) {
			throw new ApiError(500, err.message);
		}
	},
};
