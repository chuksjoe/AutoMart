import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();
require('custom-env').env(true);

// utility functions
const appendLeadZero = val => (Number(val) > 10 ? val : `0${val}`);

module.exports = {
	encodeToken: (email, id = 0) => {
		const payload = { email, id };
		const option = { expiresIn: '1d', issuer: 'automart' };
		const secret = process.env.JWT_SECRET;
		return jwt.sign(payload, secret, option);
	},

	hashPassword: (password, saltRound) => bcrypt.hashSync(password, saltRound),

	getDate: () => {
		const date = new Date();
		return `${appendLeadZero(date.getDate())}-${appendLeadZero(date.getMonth() + 1)}-${date.getFullYear()}
		 ${appendLeadZero(date.getHours())}:${appendLeadZero(date.getMinutes())}`;
	},

	validateToken: (req, res, next) => {
		if (!(req.headers && req.headers.authorization)) {
			return res.status(400).json({
				status: 400,
				data: 'Ensure you are logged in.',
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
				throw new Error(err);
			}
		} else {
			res.status(401).send({
				status: 401,
				data: 'Your token has expired. Please, re-login.',
			});
		}
		return 0;
	},
};
