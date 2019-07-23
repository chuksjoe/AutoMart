import moment from 'moment';

import validator from '../helpers/validators';
import queryText from '../db/queryText';
import db from '../db/index';

export default {
	// create new purchase order by  valid user
	async createNewOrder(req, res) {
		try {
			const { amount, car_id } = req.body;
			validator.validatePrice(amount);
			validator.validateResourceId(car_id, 'Car');

			let response = await db.query(queryText.getCar, [car_id]);
			const [car] = response.rows;
			validator.validateResource(car, 'Car');
			validator.validateCarStatus(car.status === 'Sold');
			response = await db.query(queryText.getUserById, [req.token.id]);
			const [buyer] = response.rows;
			const { rows } = await db.query(queryText.getBuyerPendingOrder, [car.id, buyer.id, 'Pending']);
			validator.validateStatus(rows[0], 'offer');
			// if (buyer.id === car.owner_id) {
			// 	throw new ApiError(400, 'You can\'t place an order on your car ad.');
			// }
			const { first_name, last_name, num_of_orders } = buyer;
			const values = [car.id, car.name, car.body_type, car.price,
			car.owner_id, car.owner, buyer.id, `${first_name} ${last_name.charAt(0)}.`,
			parseFloat(amount), 'Pending', moment()];

			const data = await db.query(queryText.createOrder, values);
			await db.query(queryText.updateUserOnPurcase, [num_of_orders + 1, req.token.id]);
			res.status(201).send({ status: 201, data: data.rows[0] });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of all purchase orders placed by the user.
	async getAllOrders(req, res) {
		try {
			const { id } = req.token;
			const { rows } = await db.query(queryText.getBuyerOrders, [id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of all purchase orders placed on the user car ads.
	async getAllSales(req, res) {
		try {
			const { id } = req.token;
			const { rows } = await db.query(queryText.getSellerOrders, [id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// update the price of a purchase order by the buyer who initialized it
	async updateOrderPrice(req, res) {
		try {
			const { order_id } = req.params;
			const { price } = req.body;
			validator.validateResourceId(order_id, 'Order');
			validator.validatePrice(price);
			let response = await db.query(queryText.getOrder, [order_id]);
			const [order] = response.rows;
			validator.validateResource(order, 'Order');
			validator.validateOwner(req.token.id === order.buyer_id);
			validator.validateAvailability(order.status === 'Pending');

			const oldPrice = order.amount;
			const values = [parseFloat(price), moment(), order_id];
			response = await db.query(queryText.updateOrderPrice, values);
			const [updatedOrder] = response.rows;
			if (updatedOrder !== null) {
				updatedOrder.old_price_offered = oldPrice;
				updatedOrder.new_price_offered = price;
				delete updatedOrder.amount;
			}
			res.status(200).send({ status: 200, data: updatedOrder });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// accept a purchase order as a seller
	async acceptOffer(req, res) {
		try {
			const { order_id } = req.params;
			validator.validateResourceId(order_id, 'Order');
			const response = await db.query(queryText.getOrder, [order_id]);
			const [order] = response.rows;
			validator.validateResource(order, 'Order');
			validator.validateOwner(req.token.id === order.owner_id);
			validator.validateAvailability(order.status === 'Pending');

			const {
				amount, buyer_name, car_name, car_id,
			} = order;
			await db.query(queryText.updateCarStatus, ['Sold', moment(), car_id]);
			const { rows } = await db.query(queryText.updateOrderStatus, ['Accepted', moment(), order_id]);
			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have accepted ${buyer_name}'s offer of ${amount} for<br><b>${car_name}</b>.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
		// reject a purchase order as a seller
	async rejectOffer(req, res) {
		try {
			const { order_id } = req.params;
			validator.validateResourceId(order_id, 'Order');
			const response = await db.query(queryText.getOrder, [order_id]);
			const [order] = response.rows;
			validator.validateResource(order, 'Order');
			validator.validateOwner(req.token.id === order.owner_id);
			validator.validateAvailability(order.status === 'Pending');

			const {	amount, buyer_name, car_name	} = order;
			const { rows } = await db.query(queryText.updateOrderStatus, ['Rejected', moment(), order_id]);
			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have rejected ${buyer_name}'s offer of ${amount} for<br><b>${car_name}</b>.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// cancel/delete a purchase order
	async deleteOrder(req, res) {
		try {
			const { id } = req.token;
			const { order_id } = req.params;
			validator.validateResourceId(order_id, 'Order');
			const { rows } = await db.query(queryText.getOrder, [order_id]);
			const [order] = rows;
			validator.validateResource(order, 'Order');
			validator.validateOwner(id === order.buyer_id);
			const { car_name, owner } = order;
			await db.query(queryText.deleteOrder, [order_id]); // delete the purchase order from database
			const response = await db.query(queryText.getUserById, [id]);
			const [user] = response.rows;
			await db.query(queryText.updateUserOnOrderDelete, [user.num_of_orders - 1, id]);
			res.status(200).json({
				status: 200,
				data: 'Purchase order successfully deleted.',
				message: `You have successfully deleted your purchase order for<br><b>${car_name} that was posted by ${owner}.</b>`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
