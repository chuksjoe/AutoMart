import { Router } from 'express';

import auth from './controllers/auth';
import cars from './controllers/cars';
import orders from './controllers/orders';

const router = Router();

// for the auth
router.post('/auth/signup', auth.createNewUser);
router.post('/auth/signin', auth.signinUser);

// for car Ads
router.post('/car', cars.createNewCarAd);
router.get('/car/:car_id', cars.getACar);
router.get('/car', cars.getAllCars);
router.delete('/car/:car_id', cars.deleteACar);
router.patch('/car/:car_id/price', cars.updateCarPrice);
router.patch('/car/:car_id/status', cars.updateCarStatus);

// for purchase orders
router.get('/order', orders.getAllOrders);
router.post('/order', orders.createNewOrder);
router.patch('/order/:order_id/price', orders.updateOrderPrice);

module.exports = router;
