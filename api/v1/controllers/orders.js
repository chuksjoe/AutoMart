import moment from 'moment';

import db from '../db/index';
import ApiError from '../helpers/ApiError';

export default {
	// create new purchase order by  valid user
	async createNewOrder(req, res) {
		const queryText0 = 'SELECT * FROM orders WHERE car_id = $1 AND buyer_id = $2 AND status = $3';
		const queryText1 = 'SELECT * FROM cars WHERE id = $1';
		const queryText2 = 'SELECT id, first_name, last_name, num_of_orders FROM users WHERE id = $1';
		const queryText3 = `INSERT INTO
		orders (car_id, car_name, car_body_type, car_price, owner_id, owner, buyer_id,
		buyer_name, amount, status, created_on)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
		const queryText4 = 'UPDATE users SET num_of_orders = $1 WHERE id = $2';
		try {
			const { amount } = req.body;
			if (amount === undefined || amount === '') {
				throw new ApiError(206, 'The price offered cannot be null.');
			}

			let response = await db.query(queryText1, [req.body.car_id]);
			const car = response.rows[0];
			if (!car) {
				throw new ApiError(404, 'Car does not exist!');
			}
			response = await db.query(queryText2, [req.token.id]);
			const buyer = response.rows[0];
			if (!buyer || car.status === 'Sold') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const { rows } = await db.query(queryText0, [car.id, buyer.id, 'Pending']);
			if (rows[0]) {
				throw new ApiError(400, 'You have a Pending offer on this car Ad.');
			}
			// if (buyer.id === car.owner_id) {
			// 	throw new ApiError(400, 'You can\'t place an order on your car ad.');
			// }
			const { first_name, last_name, num_of_orders } = buyer;
			const values = [car.id, car.name, car.body_type, car.price,
			car.owner_id, car.owner, buyer.id, `${first_name} ${last_name.charAt(0)}.`,
			parseFloat(amount), 'Pending', moment()];

			const data = await db.query(queryText3, values);
			await db.query(queryText4, [num_of_orders + 1, req.token.id]);
			res.status(201).send({ status: 201, data: data.rows[0] });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of all purchase orders placed by the user.
	async getAllOrders(req, res) {
		const queryText = 'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_on DESC';
		const { id } = req.token;
		try {
			const { rows } = await db.query(queryText, [id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of all purchase orders placed on the user car ads.
	async getAllSales(req, res) {
		const queryText = 'SELECT * FROM orders WHERE owner_id = $1 ORDER BY created_on DESC';
		const { id } = req.token;
		try {
			const { rows } = await db.query(queryText, [id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// update the price of a purchase order by the buyer who initialized it
	async updateOrderPrice(req, res) {
		const queryText1 = 'SELECT status, buyer_id, amount FROM orders WHERE id = $1';
		const queryText2 = 'UPDATE orders SET amount = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		try {
			const { order_id } = req.params;
			const { price } = req.body;
			if (price === undefined || price === '') {
				throw new ApiError(206, 'The price offered cannot be null.');
			}
			let response = await db.query(queryText1, [order_id]);
			const order = response.rows[0];
			if (!order) {
				throw new ApiError(404, 'Purchase order not found in database.');
			}
			if (req.token.id !== order.buyer_id || order.status !== 'Pending') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const old_price = order.amount;
			response = await db.query(queryText2, [parseFloat(price), moment(), order_id]);
			const updatedOrder = response.rows[0];
			if (updatedOrder !== null) {
				updatedOrder.old_price = old_price;
				updatedOrder.new_price = price;
				delete updatedOrder.amount;
			}
			res.status(200).send({ status: 200, data: updatedOrder });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// cancel/delete a purchase order
	async deleteOrder(req, res) {
		const queryText1 = 'SELECT car_name, owner, buyer_id FROM orders WHERE id = $1';
		const queryText2 = 'DELETE FROM orders WHERE id = $1';
		const queryText3 = 'SELECT num_of_orders FROM users WHERE id = $1';
		const queryText4 = 'UPDATE users SET num_of_orders = $1 WHERE id = $2';
		const { order_id } = req.params;
		const { id } = req.token;
		try {
			const { rows } = await db.query(queryText1, [order_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Purchase order not found in database.');
			}
			const { car_name, owner, buyer_id } = rows[0];
			if (id !== buyer_id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			await db.query(queryText2, [order_id]); // delete the purchase order from database
			const response = await db.query(queryText3, [id]);
			const [user] = response.rows;
			await db.query(queryText4, [user.num_of_orders - 1, id]);
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
	// accept a purchase order as a seller
	async acceptOffer(req, res) {
		const queryText1 = 'SELECT status, owner_id, amount, buyer_name, car_name FROM orders WHERE id = $1';
		const queryText2 = 'UPDATE orders SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		const queryText3 = 'UPDATE cars SET status = $1, last_modified = $2 WHERE id = $3';
		const { order_id } = req.params;
		try {
			const response = await db.query(queryText1, [order_id]);
			const order = response.rows[0];
			if (!order) {
				throw new ApiError(404, 'Purchase order not found in database.');
			}
			if (req.token.id !== order.owner_id || order.status !== 'Pending') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const {
				amount, buyer_name, car_name, car_id,
			} = order;
			const { rows } = await db.query(queryText2, ['Accepted', moment(), order_id]);
			await db.query(queryText3, ['Sold', moment(), car_id]);
			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have accepted ${buyer_name}'s offer of ${amount} for ${car_name}.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
		// reject a purchase order as a seller
	async rejectOffer(req, res) {
		const queryText1 = 'SELECT status, owner_id, amount, buyer_name, car_name FROM orders WHERE id = $1';
		const queryText2 = 'UPDATE orders SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		const { order_id } = req.params;
		try {
			const response = await db.query(queryText1, [order_id]);
			const order = response.rows[0];
			if (!order) {
				throw new ApiError(404, 'Purchase order not found in database.');
			}
			if (req.token.id !== order.owner_id || order.status !== 'Pending') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const {	amount, buyer_name, car_name	} = order;
			const { rows } = await db.query(queryText2, ['Rejected', moment(), order_id]);
			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have rejected ${buyer_name}'s offer of ${amount} for ${car_name}.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
