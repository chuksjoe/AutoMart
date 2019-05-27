import { Router } from 'express';

import users from './controllers/users';
import cars from './controllers/cars';

const router = Router();

// for the users
router.post('/auth/signup', users.createNewUser);
router.post('/auth/signin', users.signinUser);

// for car Ads
router.post('/car', cars.createNewCarAd);
router.get('/car/:car_id', cars.getACar);
router.get('/car', cars.getAllCars);
router.delete('/car/:car_id', cars.deleteACar);
router.patch('/car/:car_id/price', cars.updateCarPrice);
router.patch('/car/:car_id/status', cars.updateCarStatus);

module.exports = router;
