import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import ApiError from './ApiError';

require('dotenv').config();
require('custom-env').env(true);

// utility functions
const appendLeadZero = val => (Number(val) > 10 ? val : `0${val}`);

module.exports = {
	getDate: () => {
		const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
		const months = ['Jan', 'Feb', 'Mar', 'April', 'May',
		'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		const date = new Date();
		const hr = date.getHours();
		return `${days[date.getDay()]},
		 ${appendLeadZero(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}
		 ${appendLeadZero(hr > 12 ? hr % 12 : hr)}:${appendLeadZero(date.getMinutes())}${hr > 12 ? 'pm' : 'am'}`;
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
		if (req_body.first_name === '') errorFields.push('fname');
		if (req_body.last_name === '') errorFields.push('lname');
		if (req_body.email === '') errorFields.push('no-email');
		else if (req_body.email.indexOf('.') < 3 || req_body.email.indexOf('@') < 1) {
			errorFields.push('bad-email');
		}
		if (req_body.password.length < 8) errorFields.push('short-pass');
		else if (req_body.password.search(/\d/) < 0) errorFields.push('no-digit-in-pass');
		if (req_body.phone	!== '') {
			if (req_body.phone.length < 10) errorFields.push('phone');
		}
		return errorFields;
	},
	validateNewPostForm: (req_body) => {
		const errorFields = [];
		if (req_body.manufacturer === '') errorFields.push('manufacturer');
		if (req_body.model === '') errorFields.push('model');
		if (req_body.body_type === '') errorFields.push('body_type');
		if (req_body.year === '') errorFields.push('year');
		if (req_body.price === '') errorFields.push('price');
		if (req_body.state === '') errorFields.push('state');
		if (req_body.color === '') errorFields.push('color');
		if (req_body.mileage === '') errorFields.push('mileage');
		if (req_body.transmission_type === '') errorFields.push('transmission');
		if (req_body.fuel_type === '') errorFields.push('fuel_type');
		if (req_body.fuel_cap === '') errorFields.push('fuel_cap');
		if (req_body.doors === '') errorFields.push('doors');
		if (req_body.img_url === '') errorFields.push('img_url');
		if (req_body.description === '') errorFields.push('description');

		return errorFields;
	},
};
