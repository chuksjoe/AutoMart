import crypto from 'crypto';
import bcrypt from 'bcrypt';

// utility functions
const getToken = () => crypto.randomBytes(10).toString('hex');

const hashPassword = (password, saltRound) => bcrypt.hashSync(password, saltRound);

module.exports = { getToken, hashPassword };
