/* sample order object
const order = {
	id: 1,
	car_id: 5,
	car_name: 'new Volkswagen Cx4 - 2001',
	car_body_type: 'Van',
	price: 4500000,
	owner_id: 2,
	owner_name: 'Lorita M.',
	buyer_id: 4,
	buyer_name: 'Jonathan J.',
	price_offered: 4000000,
	created_on: Date(),
	status: 'pending', // options: pending, accepted, rejected, cancelled
};
*/
const orders = {
	last_id: 0,
	count: 0,
	orders_list: [],

	// get list of all the orders
	getAllOrders() {
		return this.orders_list;
	},

	// create a new order ad and add it to the order ads list
	createNewOrder(newOrder) {
		const order = newOrder;
		this.count += 1;
		this.last_id += 1;
		order.id = this.last_id;
		this.orders_list.push(order);

		return order;
	},
	// get a specific order given the order's id, else return null
	getAnOrder(orderId) {
		const id = orderId;
		let theOrder = null;
		this.orders_list.map((order) => {
			if (order.id === id) theOrder = order;
			return 0;
		});
		return theOrder;
	},
	// update a specific order in the orders list and return the new order object, else return null
	updateOrder(orderId, orderToUpdate) {
		const id = orderId;
		let orderIndex = null;
		this.orders_list.map((orderItem, index) => {
			if (orderItem.id === id) orderIndex = index;
			return 0;
		});
		if (orderIndex === null) return null;

		this.orders_list.splice(orderIndex, 1, orderToUpdate);
		return orderToUpdate;
	},
	/*
	// delete a order from the orders list and return the courrent count value, else return null
	deleteOrder(orderId) {
		const id = orderId;
		let orderIndex = null;
		this.orders_list.map((order, index) => {
			if (order.id === id) orderIndex = index;
			return 0;
		});
		if (orderIndex === null) return null;

		this.orders_list.splice(orderIndex, 1);
		this.count -= 1;
		return this.count;
	},
	*/
};

module.exports = orders;
