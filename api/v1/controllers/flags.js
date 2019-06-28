import moment from 'moment';

import db from '../db/index';
import ApiError from '../helpers/ApiError';

export default {
	// create new purchase order by  valid user
	async createNewFlag(req, res) {
		const queryText1 = 'SELECT * FROM cars WHERE id = $1';
		const queryText2 = 'SELECT id, first_name, last_name FROM users WHERE id = $1';
		const queryText3 = 'SELECT * FROM flags WHERE car_id = $1 AND reporter_id = $2 AND status = $3';
		const queryText4 = `INSERT INTO
		flags (car_id, car_name, owner_id, owner_name, owner_email,
		reporter_id, reason, description, status, created_on)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
		try {
			let response = await db.query(queryText1, [req.body.car_id]);
			const car = response.rows[0];
			if (!car) {
				throw new ApiError(404, 'Car does not exist!');
			}
			response = await db.query(queryText2, [req.payload.id]);
			const reporter = response.rows[0];
			if (!reporter || car.status === 'Sold') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const { rows } = await db.query(queryText3, [car.id, reporter.id, 'Pending']);
			if (rows[0]) {
				throw new ApiError(400, 'You have a Pending flag on this car Ad.');
			}
			if (reporter.id === car.owner_id) {
				throw new ApiError(400, 'You can\'t place a flag on your car ad.');
			}
			const { reason, description } = req.body;
			if (reason === '' || description === '' || reason === undefined || description === undefined) {
				throw new ApiError(206, 'Reason and Description cannot be null.');
			}

			const values = [car.id, car.name, car.owner_id, car.owner_name, car.email, reporter.id,
			reason, description, 'Pending', moment()];

			const data = await db.query(queryText4, values);
			res.status(201).send({ status: 201, data: data.rows[0] });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
