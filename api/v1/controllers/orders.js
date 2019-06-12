import orders from '../models/orders';
import users from '../models/users';
import cars from '../models/cars';
import util from '../helpers/utils';
import ApiError from '../helpers/ApiError';

export default {
	/* returns 2 lists for a user.
		purchase list, which contains the user's purchase
		sales list, which contains list of purchase orders placed on the users car ad posts
		if a user does not have not placed any order or has not recieved any order for
		any of is posted sales ad, it returns empty arrays.
	*/
	getAllOrders(req, res) {
		const user = users.getAUserById(parseInt(req.query.user_id, 10));
		const ordersList = orders.getAllOrders();
		const purchaseList = [];
		const salesList = [];
		if (user !== null) {
			ordersList.map((order) => {
				if (order.owner_id === user.id) {
					salesList.push(order);
				} else if (order.buyer_id === user.id) {
					purchaseList.push(order);
				}
				return false;
			});
		}
		res.status(200).send({
			status: 200,
			data: {
				sales_list: salesList,
				purchase_list: purchaseList,
			},
		});
	},
	// create new purchase order by  valid user
	createNewOrder(req, res) {
		try {
			const buyer = users.getAUserById(parseInt(req.body.buyer_id, 10));
			const car = cars.getACar(parseInt(req.body.car_id, 10));
			if (car === null) {
				throw new ApiError(404, 'Car does not exist!');
			}
			if (buyer === null || car.status === 'Sold') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			if (buyer.id === car.owner_id) {
				throw new ApiError(400, 'You can\'t place an order on your car ad.');
			}
			const { first_name, last_name } = buyer;
			const { car_id, buyer_id, price_offered } = req.body;

			const newOrder = orders.createNewOrder({
				car_id: parseInt(car_id, 10),
				car_name: car.name,
				car_body_type: car.body_type,
				price: car.price,
				owner_id: car.owner_id,
				owner_name: car.owner_name,
				buyer_id: parseInt(buyer_id, 10),
				buyer_name: `${first_name} ${last_name.charAt(0)}.`,
				price_offered: parseFloat(price_offered),
				status: 'Pending',
				created_on: util.getDate(),
			});
			res.status(201).send({ status: 201, data: newOrder });
		} catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
	// update the price of a purchase order by the buyer who initialized it
	updateOrderPrice(req, res) {
		try {
			const order = orders.getAnOrder(parseInt(req.params.order_id, 10));
			const buyer = users.getAUserById(parseInt(req.body.buyer_id, 10));
			const new_price = parseFloat(req.body.new_price);
			if (order === null) {
				throw new ApiError(404, 'Purchase order not found in database.');
			}
			const old_price_offered = order.price_offered;
			if (buyer === null || buyer.id !== order.buyer_id || order.status !== 'Pending') {
				throw new ApiError(401, 'Unauthorized Access!');
			}
			order.price_offered = new_price;
			// to avoid the changes to the response from affect the order object in the database
			const response = Object.assign({}, orders.updateOrder(order.id, order));
			if (response !== null) {
				response.old_price_offered = old_price_offered;
				response.new_price_offered = new_price;
				delete response.price_offered;
			}
			res.status(200).send({ status: 200, data: response });
		} catch (err) {
			res.status(err.statusCode)
			.send({ status: err.statusCode, error: err.message });
		}
	},
};
