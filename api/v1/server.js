import { Router } from 'express';

import users from './controllers/users';
import cars from './controllers/cars';

const router = Router();

// for the users
router.post('/auth/signup', users.createNewUser);
router.post('/auth/signin', users.signinUser);

// for car Ads
router.post('/car', cars.createNewCarAd);

module.exports = router;
