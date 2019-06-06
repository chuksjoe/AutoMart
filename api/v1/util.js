import crypto from 'crypto';
import bcrypt from 'bcrypt';

// utility functions
const appendLeadZero = val => (Number(val) > 10 ? val : `0${val}`);

const getToken = () => crypto.randomBytes(10).toString('hex');

const hashPassword = (password, saltRound) => bcrypt.hashSync(password, saltRound);

const getDate = () => {
	const date = new Date();
	return `${appendLeadZero(date.getDate())}-${appendLeadZero(date.getMonth() + 1)}-${date.getFullYear()}
	 ${appendLeadZero(date.getHours())}:${appendLeadZero(date.getMinutes())}`;
};

module.exports = { getToken, hashPassword, getDate };
