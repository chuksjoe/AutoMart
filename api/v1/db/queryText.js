module.exports = {
	// Queries for user controller
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

	// Queries for car Ad controller
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

	// Queries for purchase order controller
	createOrder: `INSERT INTO
		orders (car_id, car_name, car_body_type, car_price, owner_id, owner, buyer_id,
		buyer_name, amount, status, created_on)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
	getBuyerOrders: 'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_on DESC',
	getSellerOrders: 'SELECT * FROM orders WHERE owner_id = $1 ORDER BY created_on DESC',
	getOrder: 'SELECT * FROM orders WHERE id = $1',
	getBuyerPendingOrder: 'SELECT * FROM orders WHERE car_id = $1 AND buyer_id = $2 AND status = $3',
	updateUserOnPurcase: 'UPDATE users SET num_of_orders = $1 WHERE id = $2',
	updateOrderPrice: 'UPDATE orders SET amount = $1, last_modified = $2 WHERE id = $3 RETURNING *',
	updateOrderStatus: 'UPDATE orders SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *',
	deleteOrder: 'DELETE FROM orders WHERE id = $1',
	updateUserOnOrderDelete: 'UPDATE users SET num_of_orders = $1 WHERE id = $2',

	// Queries for flag controller
	createFlag: `INSERT INTO
		flags (car_id, car_name, owner_id, owner, owner_email,
		reporter_id, reason, description, status, created_on)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
	getPendingFlag: 'SELECT * FROM flags WHERE car_id = $1 AND reporter_id = $2 AND status = $3',
	getAllFlags: 'SELECT * FROM flags WHERE car_id = $1 ORDER BY created_on DESC',
	getFlag: 'SELECT * FROM flags WHERE id = $1',
	updateFlagStatus: 'UPDATE flags SET status = $1, last_modified = $2 WHERE id = $3 RETURNING *',
	deleteFlag: 'DELETE FROM flags WHERE id = $1',
};
