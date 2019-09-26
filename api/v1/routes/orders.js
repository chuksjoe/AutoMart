import { Router } from 'express';

import orders from '../controllers/orders';
import validator from '../helpers/validators';

const router = Router();

// create a purchase order
router.post('/order', validator.validateToken, orders.createNewOrder);

// get list of all purchase order for a user
router
	.get('/order', validator.validateToken, orders.getAllOrders)
	// get the list of purchase orders placed on a users' car Ads
	.get('/sale', validator.validateToken, orders.getAllSales);

// update the price offered for a car Ad by the buyer
router
	.patch(
		'/order/:order_id/price',
		validator.validateToken,
		orders.updateOrderPrice,
	)
	// accept a purchase order by the Ad owner and mark the car Ad as Sold
	.patch('/order/:order_id/accept', validator.validateToken, orders.acceptOffer)
	// reject a purchase order by the Ad owner
	.patch(
		'/order/:order_id/reject',
		validator.validateToken,
		orders.rejectOffer,
	);

// delete/cancel a purchase order by the buyer.
router.delete('/order/:order_id', validator.validateToken, orders.deleteOrder);

module.exports = router;
