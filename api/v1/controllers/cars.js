import config from 'config';

import cars from '../models/cars';
import users from '../models/users';
import util from '../utils';

const cloudinary = require('cloudinary').v2;
const debug = require('debug')('http');

cloudinary.config({
	cloud_name: config.get('cloud_name'),
	api_key: config.get('api_key'),
	api_secret: config.get('api_secret'),
});

export default {
	// create a new car Ad and add it to car ads list
	createNewCarAd(req, res) {
		const owner = users.getAUserById(parseInt(req.body.owner_id, 10));
		if (owner === null) {
			return res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
		}
		const { first_name, last_name, email } = owner;
		const {
			state, price, manufacturer, transmission_type,
			model, body_type, fuel_type, description, mileage,
			color, year, ac, arm_rest, fm_radio, dvd_player,
			tinted_windows, air_bag, owner_id, doors, fuel_cap,
		} = req.body;

		// for (let ke in req.files.img_url) {
		// 	console.warn(`req.files.image properties: ${ke}: ${req.files.img_url[ke]}`);
		// }
		cloudinary.uploader.upload(req.files.img_url.path, {
			tags: 'auto-mart',
			folder: 'uploads/',
			resource_type: 'auto',
		})
		.then((file) => {
			const newCar = cars.createNewCar({
				img_url: file.url,
				name: `${state} ${year} ${manufacturer} ${model}`,
				owner_id: parseInt(owner_id, 10),
				owner_name: `${first_name} ${last_name.charAt(0)}.`,
				email,
				created_on: util.getDate(),
				state,
				status: 'Available',
				price: parseFloat(price.replace(/\D/g, ''), 10),
				manufacturer,
				model,
				body_type,
				fuel_type,
				fuel_cap: parseInt(fuel_cap, 10),
				doors: parseInt(doors, 10),
				mileage: parseInt(mileage.replace(/\D/g, ''), 10),
				transmission_type,
				color,
				year: parseInt(year, 10),
				description,
				features: {
					ac: ac === 'true',
					arm_rest: arm_rest === 'true',
					fm_radio: fm_radio === 'true',
					dvd_player: dvd_player === 'true',
					tinted_windows: tinted_windows === 'true',
					air_bag: air_bag === 'true',
				},
			});
			return res.status(201).send({ status: 201, data: newCar });
		})
		.catch((err) => {
			if (err) {
				debug(err);
				return res.status(510).send({ status: 510, data: 'Seems like your network connection is down.' });
			}
			return 0;
		});
		return 0;
	},
	// get a specific car give the car id
	getACar(req, res) {
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		if (car !== null) {
			res.status(200).send({ status: 200, data: car });
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
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
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		if (car !== null) {
			cars.deleteACar(car.id);
			res.status(200).json({
				status: 200,
				data: 'Car AD successfully deleted.',
				message: `You have successfully deleted Ad for<br><b>${car.name}</b>`,
			});
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	updateCarPrice(req, res) {
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		const user = users.getAUserById(parseInt(req.body.user_id, 10));
		const new_price = parseFloat(req.body.new_price);
		if (car !== null) {
			if (user !== null && user.id === car.owner_id) {
				car.price = new_price;
				const response = cars.updateACar(car.id, car);
				res.status(200).send({ status: 200, data: response });
			} else {
				res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
			}
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
		}
	},
	// it's only the owner of a sale ad that can update the price of a posted ad
	updateCarStatus(req, res) {
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		const user = users.getAUserById(parseInt(req.body.user_id, 10));
		if (car !== null) {
			if (user !== null && user.id === car.owner_id) {
				car.status = 'Sold';
				const response = cars.updateACar(car.id, car);
				res.status(200).send({
					status: 200,
					data: response,
					message: `You have successfully marked<br><b>${car.name}</b><br>as sold.`,
				});
			} else {
				res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
			}
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
		}
	},
};
