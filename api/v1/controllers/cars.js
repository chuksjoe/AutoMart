import moment from 'moment';

import ApiError from '../helpers/ApiError';
import validator from '../helpers/validators';
import queryText from '../db/queryText';
import db from '../db/index';

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
		try {
			const { rows } = await db.query(queryText.getUserById, [req.token.id]);
			const {
				first_name, last_name, email, num_of_ads,
			} = rows[0];
			const {
				state, price, manufacturer, transmission_type,
				model, body_type, fuel_type, description,
				color, ac, arm_rest, fm_radio, dvd_player,
				tinted_windows, air_bag,
			} = req.body;
			const mileage = req.body.mileage || '0';
			const year = req.body.year || '0';
			const doors = req.body.doors || '0';
			const fuel_cap = req.body.fuel_cap || '0';

			if (req.files === undefined
				|| req.files.image_url === undefined || req.files.image_url === '') {
				const values = [`${state} ${year} ${manufacturer} ${model}`, null, req.token.id,
				`${first_name} ${last_name.charAt(0)}.`, email, moment(), parseInt(year, 10), state, 'Available',
				parseFloat(price.toString().replace(/\D/g, '')), manufacturer, model, body_type, fuel_type, parseInt(doors, 10),
				parseInt(fuel_cap, 10), parseInt(mileage.toString().replace(/\D/g, ''), 10), color, transmission_type,
				description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows];

				const data = await db.query(queryText.createCar, values);
				res.status(201).send({ status: 201, data: data.rows[0] });

				await db.query(queryText.updateUserOnAdPost, [num_of_ads + 1, req.token.id]);
			} else {
				cloudinary.uploader.upload(req.files.image_url.path, {
					tags: 'auto-mart',
					folder: 'uploads/',
					resource_type: 'image',
				})
				.then(async (file) => {
					let file_url = file.url;
					file_url = file_url.split('');
					file_url.splice(54, 0, 'w_600,h_400,c_fill/');
					file_url = file_url.join('');
					const values = [`${state} ${year} ${manufacturer} ${model}`, file_url, req.token.id,
					`${first_name} ${last_name.charAt(0)}.`, email, moment(), parseInt(year, 10), state, 'Available',
					parseFloat(price.toString().replace(/\D/g, '')), manufacturer, model, body_type, fuel_type, parseInt(doors, 10),
					parseInt(fuel_cap, 10), parseInt(mileage.toString().replace(/\D/g, ''), 10), color, transmission_type,
					description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows];

					const data = await db.query(queryText.createCar, values);
					res.status(201).send({ status: 201, data: data.rows[0] });

					await db.query(queryText.updateUserOnAdPost, [num_of_ads + 1, req.token.id]);
				})
				.catch((err) => {
					if (err) {
						debug(err);
						return res.status(501).send({ status: 501, error: 'Seems like your network connection is down.' });
					}
					return 0;
				});
			}
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get all cars whether sold or unsold if user is admin, else get all unsold cars
	// if filter query is entered, get a filered list of cars depending on the queries.
	async getAllCars(req, res) {
		let query = queryText.getAllCars;
		try {
			if (req.originalUrl.includes('?')) query += ' WHERE price > 0 ';
			// filter car ads based on price range
			let { min_price, max_price } = req.query;
			if (min_price !== undefined || max_price !== undefined) {
				if (min_price === undefined) min_price = 1000;
				if (max_price === undefined) max_price = Number.MAX_VALUE;
				query += ` AND price BETWEEN ${parseFloat(min_price)} AND ${parseFloat(max_price)}`;
			}

			// filter car ads based on car status
			const { status } = req.query;
			if (status !== undefined) {
				query += ` AND status = '${status}'`;
			}

			// filter car ads based on car state
			const { state } = req.query;
			if (state !== undefined) {
				query += ` AND state = '${state}'`;
			}

			// filter car ads based on car manufacturer
			const { manufacturer } = req.query;
			if (manufacturer !== undefined) {
				query += ` AND manufacturer = '${manufacturer}'`;
			}

			// filter car ads based on car body type
			const { body_type } = req.query;
			if (body_type !== undefined) {
				query += ` AND body_type = '${body_type}'`;
			}

			// filter cars for a specific owner
			const { owner_id } = req.query;
			if (owner_id !== undefined) {
				query += ` AND owner_id = '${owner_id}'`;
			}
			query += ' ORDER BY created_on DESC';

			const { rows } = await db.query(query, []);
			res.status(200).send({ status: 200, data: rows });
		} catch (err) {
			res.status(err.statusCode || 501)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// get a specific car give the car id
	async getACar(req, res) {
		try {
			const { car_id } = req.params;
			validator.validateResourceId(car_id, 'Car');
			const { rows } = await db.query(queryText.getCar, [car_id]);
			const [car] = rows;
			validator.validateResource(car, 'Car');
			res.status(200).send({ status: 200, data: car });
		} catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	async updateCarStatus(req, res) {
		try {
			const { car_id } = req.params;
			validator.validateResourceId(car_id, 'Car');
			const { rows } = await db.query(queryText.getCar, [car_id]);
			const [car] = rows;
			validator.validateResource(car, 'Car');
			validator.validateOwner(req.token.id === car.owner_id);
			validator.validateCarStatus(car.status === 'Sold');
			const response = await db.query(queryText.updateCarStatus, ['Sold', moment(), car_id]);
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
	// it's only the owner of a sale ad that can update the price of a posted ad
	async updateCarPrice(req, res) {
		try {
			const { car_id } = req.params;
			validator.validateResourceId(car_id, 'Car');
			const { price } = req.body;
			validator.validatePrice(price);
			const { rows } = await db.query(queryText.getCar, [car_id]);
			const [car] = rows;
			validator.validateResource(car, 'Car');
			validator.validateOwner(req.token.id === car.owner_id);
			const values = [parseFloat(price), moment(), car_id];
			const response = await db.query(queryText.updateCarPrice, values);
			const [data] = response.rows;
			res.status(200).send({ status: 200,	data });
		}	catch (err) {
			res.status(err.statusCode || 500)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad or an admin that can delete a posted ad
	async deleteACar(req, res) {
		try {
			const { car_id } = req.params;
			validator.validateResourceId(car_id, 'Car');
			const { id, isAdmin } = req.token;
			const { rows } = await db.query(queryText.getCar, [car_id]);
			const [car] = rows;
			validator.validateResource(car, 'Car');
			const { owner_id, name, image_url } = car;
			validator.validateOwnerOrAdmin(id === owner_id || isAdmin);

			await db.query(queryText.deleteCar, [car_id]); // delete the car ad from database
			const response = await db.query(queryText.getUserById, [owner_id]);
			const [user] = response.rows;
			await db.query(queryText.updateUserOnAdDelete, [user.num_of_ads - 1, owner_id]);
			if (image_url !== null) {
				let file_name = image_url.slice(image_url.indexOf('uploads/'));
				file_name = file_name.slice(0, file_name.indexOf('.'));
				await cloudinary.uploader.destroy(file_name, (err, result) => {
					if (err) {
						debug(`CAR DELETION: ERROR: ${err}`);
						throw new ApiError(500, `CAR DELETION: ERROR: ${err}`);
					}
					debug(`CAR DELETION: RESULT: ${result}`);
				});
			}
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
