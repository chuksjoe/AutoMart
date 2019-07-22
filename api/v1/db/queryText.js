module.exports = {
	createUser: `INSERT INTO
		users (email, password, first_name, last_name, is_admin, street, city, state,
		country, phone, zip, registered_on, num_of_ads, num_of_orders)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
	getUserByEmail: 'SELECT * FROM users WHERE email = $1',
	getUserById: 'SELECT * FROM users WHERE id = $1',
	getAllUsers: 'SELECT * FROM users ORDER BY registered_on DESC',
	getUserPassword: 'SELECT password FROM users WHERE email = $1',
	updateUserOnSignin: 'UPDATE users SET last_online = $1 WHERE email = $2',
	updateUserPassword: `UPDATE users SET password = $1, last_modified = $2
						WHERE email = $3 RETURNING first_name, last_name`,
	updateUserInfo: `UPDATE users SET street = $1, city = $2, state = $3, country = $4,
						phone = $5, zip = $6, is_admin = $7, last_modified = $8 WHERE email = $9 RETURNING *`,
	deleteUser: 'DELETE FROM users WHERE email = $1',

	createCar: `INSERT INTO
	cars (name, image_url, owner_id, owner, email, created_on, year, state, status,
	price, manufacturer, model, body_type, fuel_type, doors, fuel_cap, mileage, color,
	transmission_type, description, ac, arm_rest, air_bag, dvd_player, fm_radio, tinted_windows)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
	$16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
	updateUserOnAdPost: 'UPDATE users SET num_of_ads = $1 WHERE id = $2',
	getAllCars: 'SELECT * FROM cars',
	getCar: 'SELECT * FROM cars WHERE id = $1',
	updateCarStatus: 'UPDATE cars SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *',
	updateCarPrice: 'UPDATE cars SET price = $1, last_modified = $2 WHERE id = $3 RETURNING *',
	deleteCar: 'DELETE FROM cars WHERE id = $1',
	updateUserOnAdDelete: 'UPDATE users SET num_of_ads = $1 WHERE id = $2',
};
