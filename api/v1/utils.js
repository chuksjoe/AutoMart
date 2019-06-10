import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();
require('custom-env').env(true);

// utility functions
const appendLeadZero = val => (Number(val) > 10 ? val : `0${val}`);

module.exports = {
	getDate: () => {
		const date = new Date();
		return `${appendLeadZero(date.getDate())}-${appendLeadZero(date.getMonth() + 1)}-${date.getFullYear()}
		 ${appendLeadZero(date.getHours())}:${appendLeadZero(date.getMinutes())}`;
	},

	hashPassword: (password, saltRound) => bcrypt.hashSync(password, saltRound),

	encodeToken: (email, id = 0) => {
		const payload = { email, id };
		const option = { expiresIn: '1d', issuer: 'automart' };
		const secret = process.env.JWT_SECRET;
		return jwt.sign(payload, secret, option);
	},

	validateToken: (req, res, next) => {
		if (!(req.headers && req.headers.authorization)) {
			return res.status(400).json({
				status: 400,
				error: 'Ensure you are logged in.',
			});
		}
		const authorizationHeader = req.headers.authorization;
		let result;
		if (authorizationHeader) {
			const token = req.headers.authorization.split(' ')[1];
			const options = {
				expiresIn: '1d',
				issuer: 'automart',
			};
			try {
				result = jwt.verify(token, process.env.JWT_SECRET, options);
				req.decoded = result;
				next();
			}	catch (err) {
				return res.status(401).send({
					status: 401,
					error: 'Your token has expired. Please, re-login.',
					message: err,
				});
				// throw new Error(err);
			}
		} else {
			res.status(401).send({
				status: 401,
				error: 'Your token has expired. Please, re-login.',
			});
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
