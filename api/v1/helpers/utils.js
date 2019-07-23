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

	encodeToken: (email, id, isAdmin) => {
		const token = { email, id, isAdmin };
		const option = { expiresIn: '1d', issuer: 'automart' };
		const secret = process.env.JWT_SECRET;
		return jwt.sign(token, secret, option);
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
