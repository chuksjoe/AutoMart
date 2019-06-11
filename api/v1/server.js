import { Router } from 'express';
import multipart from 'connect-multiparty';

import auth from './controllers/auth';
import cars from './controllers/cars';
import orders from './controllers/orders';
import util from './helpers/utils';

const multipartMiddleware = multipart();
const router = Router();

// for the auth
router.post('/auth/signup', auth.createNewUser);
router.post('/auth/signin', auth.signinUser);

// for car Ads
router.post('/car', util.validateToken, multipartMiddleware, cars.createNewCarAd);
router.get('/car/:car_id', cars.getACar);
router.get('/car', cars.getAllCars);
router.delete('/car/:car_id', util.validateToken, cars.deleteACar);
router.patch('/car/:car_id/price', util.validateToken, cars.updateCarPrice);
router.patch('/car/:car_id/status', util.validateToken, cars.updateCarStatus);

// for purchase orders
router.get('/order', util.validateToken, orders.getAllOrders);
router.post('/order', util.validateToken, orders.createNewOrder);
router.patch('/order/:order_id/price', util.validateToken, orders.updateOrderPrice);

module.exports = router;
