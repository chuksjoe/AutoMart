import { Router } from 'express';
import multipart from 'connect-multiparty';

import auth from './controllers/auth';
import cars from './controllers/cars';
import orders from './controllers/orders';
import flags from './controllers/flags';
import validator from './helpers/validators';

const multipartMiddleware = multipart();
const router = Router();

// for the auth
router.post('/auth/signup', validator.validateUserRegForm, auth.createNewUser);
router.post('/auth/signin', validator.validateUserSignin, auth.signinUser);
router.post('/user/:email/reset_password', validator.validatePasswordReset, auth.resetPassword);
router.get('/user', validator.validateToken, validator.validateAdmin1, auth.getAllUsers);
router.get('/user/:user_id', validator.validateToken, auth.getAUser);
router.patch('/user/:email/update_details', validator.validateToken, auth.updateUserDetails);
router.delete('/user/:email', validator.validateToken, auth.deleteUser);

// for car Ads
router.post('/car', validator.validateToken, multipartMiddleware, cars.createNewCarAd);
router.get('/car/:car_id', validator.validateToken, cars.getACar);
router.get('/car', validator.validateToken, cars.getAllCars);
router.patch('/car/:car_id/price', validator.validateToken, cars.updateCarPrice);
router.patch('/car/:car_id/status', validator.validateToken, cars.updateCarStatus);
router.delete('/car/:car_id', validator.validateToken, cars.deleteACar);

// for purchase orders
router.post('/order', validator.validateToken, orders.createNewOrder);
router.get('/order', validator.validateToken, orders.getAllOrders);
router.get('/sale', validator.validateToken, orders.getAllSales);
router.patch('/order/:order_id/price', validator.validateToken, orders.updateOrderPrice);
router.patch('/order/:order_id/accept', validator.validateToken, orders.acceptOffer);
router.patch('/order/:order_id/reject', validator.validateToken, orders.rejectOffer);
router.delete('/order/:order_id', validator.validateToken, orders.deleteOrder);

// for flagging a car ad
router.post('/flag', validator.validateToken, flags.createNewFlag);
router.get('/flag/:car_id', validator.validateToken, flags.getAllFlags);
router.patch('/flag/:flag_id/status', validator.validateToken, flags.addressFlag);
router.delete('/flag/:flag_id', validator.validateToken, flags.deleteOrder);

module.exports = router;
