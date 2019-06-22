import uuidv4 from 'uuidv4';
import moment from 'moment';

import db from '../db/index';
// import orders from '../models/orders';
// import users from '../models/users';
// import cars from '../models/cars';
// import util from '../helpers/utils';
import ApiError from '../helpers/ApiError';

export default {
	// create new purchase order by  valid user
	async createNewOrder(req, res) {
		const queryText1 = 'SELECT * FROM cars WHERE id = $1';
		const queryText2 = 'SELECT id, first_name, last_name FROM users WHERE id = $1';
		const queryText3 = `INSERT INTO
		orders (id, car_id, car_name, car_body_type, price, owner_id, owner_name, buyer_id,
		buyer_name, price_offered, status, created_on)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
		try {
			let response = await db.query(queryText1, [req.body.car_id]);
			const car = response.rows[0];
			if (!car) {
				throw new ApiError(404, 'Car does not exist!');
			}
			response = await db.query(queryText2, [req.payload.id]);
			const buyer = response.rows[0];
			if (!buyer || car.status === 'Sold') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			if (buyer.id === car.owner_id) {
				throw new ApiError(401, 'You can\'t place an order on your car ad.');
			}
			const { id, first_name, last_name } = buyer;
			const { price_offered } = req.body;

			const values = [uuidv4(), car.id, car.name, car.body_type, car.price,
			car.owner_id, car.owner_name, id, `${first_name} ${last_name.charAt(0)}.`,
			parseFloat(price_offered), 'Pending', moment()];

			const data = await db.query(queryText3, values);
			res.status(201).send({ status: 201, data: data.rows[0] });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of all purchase orders placed by the user.
	async getAllOrders(req, res) {
		const queryText = 'SELECT * FROM orders WHERE buyer_id = $1';
		const { id } = req.payload;
		try {
			const { rows } = await db.query(queryText, [id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
