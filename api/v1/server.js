import { Router } from 'express';

import users from './controllers/users';

const router = Router();

// for the users
router.post('/auth/signup', users.createNewUser);

module.exports = router;
