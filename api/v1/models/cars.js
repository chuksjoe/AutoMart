import carsData from './carsData';

const cars = {
	last_id: 12,
	count: 12,
	cars_list: carsData,

	// get list of all the cars
	getAllCars() {
		return this.cars_list;
	},
	// create a new car ad and add it to the car ads list
	createNewCar(car) {
		const newCar = car;
		this.count += 1;
		this.last_id += 1;
		newCar.id = this.last_id;
		this.cars_list.push(newCar);

		return newCar;
	},
	// get a specific car given the car's id, else return null
	getACar(carId) {
		const id = carId;
		let theCar = null;
		this.cars_list.map((car) => {
			if (car.id === id) theCar = car;
			return 0;
		});
		return theCar;
	},
	// update a specific car in the cars list and return the new car object, else return null
	updateACar(carId, carToUpdate) {
		const id = carId;
		let carIndex = null;
		this.cars_list.map((carItem, index) => {
			if (carItem.id === id) carIndex = index;
			return 0;
		});
		if (carIndex === null) return null;

		this.cars_list.splice(carIndex, 1, carToUpdate);
		return carToUpdate;
	},
	// delete a car from the cars list and return the courrent count value, else return null
	deleteACar(carId) {
		const id = carId;
		let carIndex = null;
		this.cars_list.map((car, index) => {
			if (car.id === id) carIndex = index;
			return 0;
		});
		if (carIndex === null) return null;

		this.cars_list.splice(carIndex, 1);
		this.count -= 1;
		return this.count;
	},
};

module.exports = cars;
