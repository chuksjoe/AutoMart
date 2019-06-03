import cars from '../models/cars';
import users from '../models/users';
import util from '../util';

export default {
	// create a new car Ad and add it to car ads list
	createNewCarAd(req, res) {
		const owner = users.getAUserById(parseInt(req.body.owner_id, 10));
		if (owner === null) {
			return res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
		}
		const { first_name, last_name, email } = owner;
		const {
			img_url, state, status, price, manufacturer,
			model, body_type, fuel_type, description, mileage,
			color, year, ac, arm_rest, fm_radio, dvd_player,
			tinted_windows, air_bag, owner_id,
		} = req.body;

		const newCar = cars.createNewCar({
			img_url,
			name: `${state} ${manufacturer} ${model} - ${year}`,
			owner_id: parseInt(owner_id, 10),
			owner_name: `${first_name} ${last_name.charAt(0)}.`,
			email,
			created_on: util.getDate(),
			state,
			status,
			price: parseFloat(price, 10),
			manufacturer,
			model,
			body_type,
			fuel_type,
			mileage: parseInt(mileage, 10),
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
		const { min_price, max_price } = req.query;
		if (min_price !== undefined && max_price !== undefined) {
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
		return res.status(200).send({ status: 200, data: carsList });
	},
	// it's only the owner of a sale ad or an admin that can delete a posted ad
	deleteACar(req, res) {
		const car = cars.getACar(parseInt(req.params.car_id, 10));
		if (car !== null) {
			cars.deleteACar(car.id);
			res.status(200).json({ status: 200, data: 'Car AD successfully deleted.' });
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
				res.status(201).send({ status: 201, data: response });
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
				car.status = 'sold';
				const response = cars.updateACar(car.id, car);
				res.status(201).send({ status: 201, data: response });
			} else {
				res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
			}
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
		}
	},
};
