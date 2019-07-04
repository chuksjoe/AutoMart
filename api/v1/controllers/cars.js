import moment from 'moment';

import db from '../db/index';
import util from '../helpers/utils';
import ApiError from '../helpers/ApiError';

const cloudinary = require('cloudinary').v2;
const debug = require('debug')('http');

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

export default {
	// create a new car Ad and add it to car ads list
	async createNewCarAd(req, res) {
		const queryText1 = 'SELECT first_name, last_name, email, num_of_ads FROM users WHERE id = $1';
		const queryText2 = `INSERT INTO
		cars (name, img_url, owner_id, owner_name, email, created_on, year, state, status,
		price, manufacturer, model, body_type, fuel_type, doors, fuel_cap, mileage, color,
		transmission_type, description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
		$16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`;
		const queryText3 = 'UPDATE users SET num_of_ads = $1 WHERE id = $2';
		try {
			const { rows } = await db.query(queryText1, [req.payload.id]);
			const owner = rows[0];
			if (!owner) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			if (util.validateNewPostForm(req.body).length > 0) {
				throw new ApiError(206, 'Some required fields are not properly filled.');
			}
			if (req.files.img_url === undefined) {
				throw new ApiError(206, 'You have not selected any image for your post.');
			}
			const {
				first_name, last_name, email, num_of_ads,
			} = owner;
			const {
				state, price, manufacturer, transmission_type,
				model, body_type, fuel_type, description, mileage,
				color, year, ac, arm_rest, fm_radio, dvd_player,
				tinted_windows, air_bag, doors, fuel_cap,
			} = req.body;

			cloudinary.uploader.upload(req.files.img_url.path, {
				tags: 'auto-mart',
				folder: 'uploads/',
				resource_type: 'image',
			})
			.then(async (file) => {
				let file_url = file.url;
				file_url = file_url.split('');
				file_url.splice(54, 0, 'w_600,h_400,c_fill/');
				file_url = file_url.join('');
				const values = [`${state} ${year} ${manufacturer} ${model}`, file_url, req.payload.id,
				`${first_name} ${last_name.charAt(0)}.`, email, moment(), parseInt(year, 10), state, 'Available',
				parseFloat(price.replace(/\D/g, '')), manufacturer, model, body_type, fuel_type, parseInt(doors, 10),
				parseInt(fuel_cap, 10), parseInt(mileage.replace(/\D/g, ''), 10), color, transmission_type,
				description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows];

				const data = await db.query(queryText2, values);
				res.status(201).send({ status: 201, data: data.rows[0] });

				await db.query(queryText3, [num_of_ads + 1, req.payload.id]);
			})
			.catch((err) => {
				if (err) {
					debug(err);
					return res.status(599).send({ status: 599, error: 'Seems like your network connection is down.' });
				}
				return 0;
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get all cars whether sold or unsold if user is admin, else get all unsold cars
	// if filter query is entered, get a filered list of cars depending on the queries.
	async getAllCars(req, res) {
		let queryText = 'SELECT * FROM cars';
		if (req.originalUrl.includes('?')) queryText += ' WHERE price > 0 ';
		// filter car ads based on price range
		let { min_price, max_price } = req.query;
		if (min_price !== undefined || max_price !== undefined) {
			if (min_price === undefined) min_price = 1000;
			if (max_price === undefined) max_price = Number.MAX_VALUE;
			queryText += ` AND price BETWEEN ${parseFloat(min_price)} AND ${parseFloat(max_price)}`;
		}

		// filter car ads based on car status
		const { status } = req.query;
		if (status !== undefined) {
			queryText += ` AND status = '${status}'`;
		}

		// filter car ads based on car state
		const { state } = req.query;
		if (state !== undefined) {
			queryText += ` AND state = '${state}'`;
		}

		// filter car ads based on car manufacturer
		const { manufacturer } = req.query;
		if (manufacturer !== undefined) {
			queryText += ` AND manufacturer = '${manufacturer}'`;
		}

		// filter car ads based on car body type
		const { body_type } = req.query;
		if (body_type !== undefined) {
			queryText += ` AND body_type = '${body_type}'`;
		}

		// filter cars for a specific owner
		const { owner_id } = req.query;
		if (owner_id !== undefined) {
			queryText += ` AND owner_id = '${owner_id}'`;
		}
		queryText += ' ORDER BY created_on DESC';
		try {
			const { rows } = await db.query(queryText, []);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 501)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	async updateCarStatus(req, res) {
		const queryText1 = 'SELECT status, owner_id FROM cars WHERE id = $1';
		const queryText2 = 'UPDATE cars SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		const { car_id } = req.params;
		try {
			const { rows } = await db.query(queryText1, [car_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Car not found in database.');
			}
			if (req.payload.id !== rows[0].owner_id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const response = await db.query(queryText2, ['Sold', moment(), car_id]);
			const [data] = response.rows;
			res.status(200).send({
				status: 200,
				data,
				message: `You have successfully marked<br><b>${data.name}</b><br>as sold.`,
			});
		}	catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get a specific car give the car id
	async getACar(req, res) {
		const queryText = 'SELECT * FROM cars WHERE id = $1';
		const { car_id } = req.params;
		try {
			const { rows } = await db.query(queryText, [car_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Car not found in database.');
			}
			res.status(200).send({ status: 200, data: rows[0] });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	async updateCarPrice(req, res) {
		const queryText1 = 'SELECT status, owner_id FROM cars WHERE id = $1';
		const queryText2 = 'UPDATE cars SET price = $1, last_modified = $2 WHERE id = $3 RETURNING *';
		const { car_id } = req.params;
		const new_price = parseFloat(req.body.new_price);
		try {
			const { rows } = await db.query(queryText1, [car_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Car not found in database.');
			}
			if (req.payload.id !== rows[0].owner_id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			const response = await db.query(queryText2, [new_price, moment(), car_id]);
			const [data] = response.rows;
			res.status(200).send({ status: 200,	data });
		}	catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad or an admin that can delete a posted ad
	async deleteACar(req, res) {
		const queryText1 = 'SELECT name, owner_id, img_url FROM cars WHERE id = $1';
		const queryText2 = 'DELETE FROM cars WHERE id = $1';
		const queryText3 = 'SELECT num_of_ads FROM users WHERE id = $1';
		const queryText4 = 'UPDATE users SET num_of_ads = $1 WHERE id = $2';
		const { car_id } = req.params;
		const { id, admin } = req.payload;
		try {
			const { rows } = await db.query(queryText1, [car_id]);
			if (!rows[0]) {
				throw new ApiError(404, 'Car not found in database.');
			}
			const { owner_id, name, img_url } = rows[0];
			if (id !== owner_id && !admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			await db.query(queryText2, [car_id]); // delete the car ad from database
			const response = await db.query(queryText3, [owner_id]);
			const [user] = response.rows;
			await db.query(queryText4, [user.num_of_ads - 1, owner_id]);
			let file_name = img_url.slice(img_url.indexOf('uploads/'));
			file_name = file_name.slice(0, file_name.indexOf('.'));
			await cloudinary.uploader.destroy(file_name, (err, result) => {
				if (err) {
					debug(`CAR DELETION: ERROR: ${err}`);
					throw new ApiError(500, `CAR DELETION: ERROR: ${err}`);
				}
				debug(`CAR DELETION: RESULT: ${result}`);
			});
			res.status(200).json({
				status: 200,
				data: 'Car AD successfully deleted.',
				message: `You have successfully deleted Ad for<br><b>${name}</b>`,
			});
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
