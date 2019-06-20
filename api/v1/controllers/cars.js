import uuidv4 from 'uuidv4';
import moment from 'moment';

import db from '../db/index';
import cars from '../models/cars';
import users from '../models/users';
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
		const queryText1 = 'SELECT first_name, last_name, email FROM users WHERE id = $1';
		const queryText2 = `INSERT INTO
		cars (id, name, img_url, owner_id, owner_name, email, created_on, year, state, status,
		price, manufacturer, model, body_type, fuel_type, doors, fuel_cap, mileage, color,
		transmission_type, description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
		$16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING *`;
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
				first_name, last_name, email,
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
				resource_type: 'auto',
			})
			.then(async (file) => {
				const values = [uuidv4(), `${state} ${year} ${manufacturer} ${model}`, file.url, req.payload.id,
				`${first_name} ${last_name.charAt(0)}.`, email, moment(), parseInt(year, 10), state, 'Available',
				parseFloat(price.replace(/\D/g, ''), 10), manufacturer, model, body_type, fuel_type, parseInt(doors, 10),
				parseInt(fuel_cap, 10), parseInt(mileage.replace(/\D/g, ''), 10), color, transmission_type,
				description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows];

				const data = await db.query(queryText2, values);
				return res.status(201).send({ status: 201, data: data.rows[0] });
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
	// get a specific car give the car id
	getACar(req, res) {
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		if (car !== null) {
			res.status(200).send({ status: 200, data: car });
		} else {
			res.status(404).send({ status: 404, error: 'Car not found in database.' });
		}
	},
	// get all cars whether sold or unsold if user is admin, else get all unsold cars
	// if filter query is entered, get a filered list of cars depending on the queries.
	getAllCars(req, res) {
		let carsList = cars.getAllCars();
		// filter car ads based on price range
		let { min_price, max_price } = req.query;
		if (min_price !== undefined || max_price !== undefined) {
			if (min_price === undefined) min_price = 1000;
			if (max_price === undefined) max_price = Number.MAX_VALUE;
			carsList = carsList.filter(car => car.price >= min_price && car.price <= max_price);
		}

		// filter car ads based on car status
		const { status } = req.query;
		if (status !== undefined) {
			carsList = carsList.filter(car => car.status === status);
		}

		// filter car ads based on car state
		const { state } = req.query;
		if (state !== undefined) {
			carsList = carsList.filter(car => car.state === state);
		}

		// filter car ads based on car manufacturer
		const { manufacturer } = req.query;
		if (manufacturer !== undefined) {
			carsList = carsList.filter(car => car.manufacturer === manufacturer);
		}

		// filter car ads based on car body type
		const { body_type } = req.query;
		if (body_type !== undefined) {
			carsList = carsList.filter(car => car.body_type === body_type);
		}

		// filter cars for a specific owner
		let { owner_id } = req.query;
		if (owner_id !== undefined) {
			owner_id = parseInt(owner_id, 10);
			carsList = carsList.filter(car => car.owner_id === owner_id);
		}
		return res.status(200).send({ status: 200, data: carsList });
	},
	// it's only the owner of a sale ad or an admin that can delete a posted ad
	deleteACar(req, res) {
		try {
			const car = cars.getACar(parseInt(req.params.car_id, 10));
			const { email, admin } = req.payload;
			if (car === null) {
				throw new ApiError(404, 'Car not found in database.');
			}
			if (car.email !== email && !admin) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			cars.deleteACar(car.id);
			res.status(200).json({
				status: 200,
				data: 'Car AD successfully deleted.',
				message: `You have successfully deleted Ad for<br><b>${car.name}</b>`,
			});
		} catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	updateCarPrice(req, res) {
		try {
			const car = cars.getACar(parseInt(req.params.car_id, 10));
			const new_price = parseFloat(req.body.new_price);
			const { id } = req.payload;
			if (car === null) {
				throw new ApiError(404, 'Car not found in database.');
			}
			if (id !== car.owner_id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			car.price = new_price;
			const response = cars.updateACar(car.id, car);
			res.status(200).send({ status: 200, data: response });
		} catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	updateCarStatus(req, res) {
		try {
			const car = cars.getACar(parseInt(req.params.car_id, 10));
			const { id } = req.payload;
			if (car === null) {
				throw new ApiError(404, 'Car not found in database.');
			}
			if (id !== car.owner_id) {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			car.status = 'Sold';
			const response = cars.updateACar(car.id, car);
			res.status(200).send({
				status: 200,
				data: response,
				message: `You have successfully marked<br><b>${car.name}</b><br>as sold.`,
			});
		}	catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
