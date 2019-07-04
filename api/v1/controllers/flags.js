import moment from 'moment';

import db from '../db/index';
import ApiError from '../helpers/ApiError';
import utils from '../helpers/utils';

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
			if (req.body.car_id === undefined || req.body.car_id === '') {
				throw new ApiError(206, 'The car ID is required');
			}
			const { reason, description } = req.body;
			if (reason === '' || description === '' || reason === undefined || description === undefined) {
				throw new ApiError(206, 'Reason and Description cannot be null.');
			}
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
			const values = [car.id, car.name, car.owner_id, car.owner_name, car.email, reporter.id,
			reason, description, 'Pending', moment()];

			const data = await db.query(queryText4, values);
			const mailOption = {
				from: '"AutoMart Help" <automart.help@gmail.com>',
				to: car.email,
				subject: `AutoMart - Your AD (${car.name}) has been flagged`,
				html: `<h3>Your AD (${car.name}) has been flagged</h3>
				<p>Hi ${car.owner_name},</p>
				<p>your car ad posted on ${car.created_on} has been flagged for reason bothering on ${reason}.</p>
				<p>Details of the flag is as follow:</p><hr>
				<h4>Reason: ${reason}</h4>
				<p>Description:</br>
				${description}</p><hr><hr>
				<p>Kindly review the affected ad and address the issue, then notify us to mark the report as addressed.</p>`,
			};
			utils.sendMail(mailOption);
			res.status(201).send({
				status: 201,
				data: data.rows[0],
				message: `You have successfully flagged ${car.name} for reason bothering on ${reason}.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// return the list of flags if the user is the car owner or an admin.
	async getAllFlags(req, res) {
		const queryText1 = 'SELECT name, owner_id FROM cars WHERE id = $1';
		const queryText2 = 'SELECT * FROM flags WHERE car_id = $1 ORDER BY created_on DESC';
		try {
			const { id, admin } = req.payload;
			const { car_id } = req.params;
			const response = await db.query(queryText1, [car_id]);
			const car = response.rows[0];
			if (!car) {
				throw new ApiError(404, 'Car does not exist!');
			}
			if (car.owner_id !== id && !admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const { rows } = await db.query(queryText2, [car_id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// accept a purchase order as a seller
	async addressFlag(req, res) {
		const queryText1 = 'SELECT status, owner_name, car_name, reason, description owner_email FROM flags WHERE id = $1';
		const queryText2 = 'UPDATE flags SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		try {
			const { flag_id } = req.params;
			const response = await db.query(queryText1, [flag_id]);
			let flag = response.rows[0];
			if (!req.payload.admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			if (!flag) {
				throw new ApiError(404, 'Flag not found in database.');
			}
			if (flag.status !== 'Pending') {
				throw new ApiError(400, 'This Flag has been Addressed before.');
			}
			const { rows } = await db.query(queryText2, ['Addressed', moment(), flag_id]);
			[flag] = rows;
			const {
				car_name, owner_email, owner_name, reason, description,
			} = flag;
			const mailOption = {
				from: '"AutoMart Help" <automart.help@gmail.com>',
				to: owner_email,
				subject: `AutoMart - Flag on ${car_name} has been Addressed`,
				html: `<h3>Flag on ${car_name} has been Addressed</h3>
				<p>Hi ${owner_name},</p>
				<p>be notified that the flag placed on your above named car ad on AutoMart has been addressed.</p>
				<p>Details of the flag is as follow:</p><hr>
				<h4>Reason: ${reason}</h4>
				<p>Description:</br>
				${description}</p><hr><hr>`,
			};
			utils.sendMail(mailOption);
			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have marked the flag on ${reason} placed on ${car_name} that is owned by ${owner_name} as Addressed.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// cancel/delete a flag
	async deleteOrder(req, res) {
		const queryText1 = 'SELECT car_name, owner_name FROM flags WHERE id = $1';
		const queryText2 = 'DELETE FROM flags WHERE id = $1';
		const { flag_id } = req.params;
		const { admin } = req.payload;
		try {
			if (!admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const { rows } = await db.query(queryText1, [flag_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Flag not found in database.');
			}
			const { car_name, owner_name } = rows[0];
			await db.query(queryText2, [flag_id]);
			res.status(200).json({
				status: 200,
				data: `Flag on ${car_name} successfully deleted.`,
				message: `You have successfully deleted a flag on<br><b>${car_name} that was posted by ${owner_name}.</b>`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
