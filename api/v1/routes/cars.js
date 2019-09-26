import { Router } from 'express';
import multipart from 'connect-multiparty';

import cars from '../controllers/cars';
import validator from '../helpers/validators';

const multipartMiddleware = multipart();
const router = Router();

// create a new car Ad
router.post(
	'/car',
	validator.validateToken,
	multipartMiddleware,
	validator.validateNewPostForm,
	cars.createNewCarAd,
);

// get the list of car Ads
router
	.get('/car', validator.validateToken, cars.getAllCars)
	// get a specific car Ad
	.get('/car/:car_id', validator.validateToken, cars.getACar);

// update the price of a car Ad by the owner
router
	.patch('/car/:car_id/price', validator.validateToken, cars.updateCarPrice)
	// mark a car Ad as Sold by the owner
	.patch('/car/:car_id/status', validator.validateToken, cars.updateCarStatus);

// delete a car Ad by either the owner or an admin
router.delete('/car/:car_id', validator.validateToken, cars.deleteACar);

module.exports = router;
