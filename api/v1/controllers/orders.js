import orders from '../models/orders';
import users from '../models/users';
import cars from '../models/cars';

export default {
	/* returns 2 lists for a user.
		purchase list, which contains the user's purchase
		sales list, which contains list of purchase orders placed on the users car ad posts
		if a user does not have not placed any order or has not recieved any order for
		any of is posted sales ad, it returns empty arrays.
	*/
	getAllOrders(req, res) {
		const user = users.getAUserById(parseInt(req.body.user_id, 10));
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
		const buyer = users.getAUserById(parseInt(req.body.buyer_id, 10));
		const car = cars.getACar(parseInt(req.body.car_id, 10));
		if (car !== null) {
			if (buyer === null || car.status === 'sold') {
				return res.status(401).send({ status: 401, data: 'Unauthorized Access!' });
			}
		}
		if (car === null) {
			return res.status(404).send({ status: 404, data: 'Car does not exist!' });
		}
		const { first_name, last_name } = buyer;
		const { car_id, buyer_id, price_offered } = req.body;

		const newOrder = orders.createNewOrder({
			car_id: parseInt(car_id, 10),
			car_name: car.name,
			price: car.price,
			owner_id: car.owner_id,
			owner_name: car.owner_name,
			buyer_id: parseInt(buyer_id, 10),
			buyer_name: `${first_name} ${last_name.charAt(0)}.`,
			price_offered: parseFloat(price_offered),
			status: 'pending',
			created_on: Date(),
		});
		return res.status(201).send({ status: 201, data: newOrder });
	},
};
