import moment from 'moment';

import ApiError from '../helpers/ApiError';
import validator from '../helpers/validators';
import sendEmails from '../helpers/sendEmails';
import db from '../db/index';
import queryText from '../db/queryText';


export default {
	// create new purchase order by  valid user
	async createNewFlag(req, res) {
		try {
			const { reason, description, car_id } = req.body;
			validator.validateResourceId(car_id, 'Car');
			let response = await db.query(queryText.getCar, [car_id]);
			const [car] = response.rows;
			validator.validateResource(car, 'Car');
			validator.validateCarStatus(car.status === 'Sold');

			response = await db.query(queryText.getUserById, [req.token.id]);
			const [reporter] = response.rows;
			validator.validateResource(reporter, 'User');
			validator.validateOwnership(reporter.id === car.owner_id, 'flag');

			const { rows } = await db.query(queryText.getPendingFlag, [car.id, reporter.id, 'Pending']);
			validator.validateStatus(rows[0], 'flag');
			const values = [car.id, car.name, car.owner_id, car.owner, car.email, reporter.id,
			reason, description, 'Pending', moment()];

			const data = await db.query(queryText.createFlag, values);
			sendEmails.sendFlagMessage({ car, reason, description });

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
		try {
			const { id, isAdmin } = req.token;
			const { car_id } = req.params;
			validator.validateResourceId(car_id, 'Car');
			const response = await db.query(queryText.getCar, [car_id]);
			const [car] = response.rows;
			validator.validateResource(car, 'Car');
			validator.validateOwnerOrAdmin(car.owner_id === id || isAdmin);

			const { rows } = await db.query(queryText.getAllFlags, [car_id]);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// accept a purchase order as a seller
	async addressFlag(req, res) {
		try {
			const { flag_id } = req.params;
			const response = await db.query(queryText.getFlag, [flag_id]);
			let [flag] = response.rows;
			validator.validateResource(flag, 'Flag');
			if (flag.status !== 'Pending') {
				throw new ApiError(400, 'This Flag has been Addressed before.');
			}
			const { rows } = await db.query(queryText.updateFlagStatus, ['Addressed', moment(), flag_id]);
			[flag] = rows;
			const {
				car_name, owner, reason, description,
			} = flag;
			sendEmails.sendAddressedFlagMessage({ flag, reason, description });

			res.status(200).send({
				status: 200,
				data: rows[0],
				message: `You have marked the flag on ${reason} placed on ${car_name} that is owned by ${owner} as Addressed.`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// cancel/delete a flag
	async deleteFlag(req, res) {
		try {
			const { flag_id } = req.params;
			validator.validateResourceId(flag_id, 'Flag');
			const { rows } = await db.query(queryText.getFlag, [flag_id]);
			const [flag] = rows;
			validator.validateResource(flag, 'Flag');
			const { car_name, owner } = flag;
			await db.query(queryText.deleteFlag, [flag_id]);
			res.status(200).json({
				status: 200,
				data: `Flag on ${car_name} successfully deleted.`,
				message: `You have successfully deleted a flag on<br><b>${car_name} that was posted by ${owner}.</b>`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
