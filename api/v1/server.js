import { Router } from 'express';
import multipart from 'connect-multiparty';

import auth from './controllers/auth';
import cars from './controllers/cars';
import orders from './controllers/orders';
import flags from './controllers/flags';
import util from './helpers/utils';

const multipartMiddleware = multipart();
const router = Router();

// for the auth
router.post('/auth/signup', auth.createNewUser);
router.post('/auth/signin', auth.signinUser);
router.post('/user/:email/reset_password', auth.resetPassword);
router.get('/user', util.validateToken, auth.getAllUsers); // for admin access only
router.patch('/user/:email/update_details', util.validateToken, auth.updateUserDetails);

// for car Ads
router.post('/car', util.validateToken, multipartMiddleware, cars.createNewCarAd);
router.get('/car/:car_id', cars.getACar);
router.get('/car', cars.getAllCars);
router.delete('/car/:car_id', util.validateToken, cars.deleteACar);
router.patch('/car/:car_id/price', util.validateToken, cars.updateCarPrice);
router.patch('/car/:car_id/status', util.validateToken, cars.updateCarStatus);

// for purchase orders
router.post('/order', util.validateToken, orders.createNewOrder);
router.get('/order', util.validateToken, orders.getAllOrders);
router.get('/sale', util.validateToken, orders.getAllSales);
router.patch('/order/:order_id/price', util.validateToken, orders.updateOrderPrice);
router.delete('/order/:order_id', util.validateToken, orders.deleteOrder);
router.patch('/order/:order_id/accept', util.validateToken, orders.acceptOffer);
router.patch('/order/:order_id/reject', util.validateToken, orders.rejectOffer);

// for flagging a car ad
router.post('/flag', util.validateToken, flags.createNewFlag);
router.get('/flag/:car_id', util.validateToken, flags.getAllFlags);
router.patch('/flag/:flag_id/status', util.validateToken, flags.addressFlag);
router.delete('/flag/:flag_id', util.validateToken, flags.deleteOrder);

module.exports = router;
