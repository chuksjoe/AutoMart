import cars from '../models/cars';
import users from '../models/users';

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
			created_on: Date(),
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
		const user = users.getAUserById(parseInt(req.body.user_id, 10));

		if (car !== null) {
			if (car.status === 'available' || (user !== null && (car.owner_id === user.id || user.is_admin))) {
				res.status(200).send({ status: 200, data: car });
			} else {
				res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
			}
		} else {
			res.status(404).send({ status: 404, data: 'Car not found in database.' });
		}
	},
};
