/* sample flag object
const order = {
	id: 1,
	car_id: 5,
	car_name: 'new Volkswagen Cx4 - 2001',
	car_price: 4500000,
	creator_id: 2,
	creator_name: 'Lorita M.',
	created_on: new Date(),
	status: 'pending', // options: pending, processed, cancelled, others
};
*/
const flags = {
	last_id: 0,
	count: 0,
	flags_list: [],

	// get list of all the orders
	getAllFlags: function getAllFlags() {
		return this.flags_list;
	},

	// create a new order ad and add it to the order ads list
	createNewFlag: function createNewFlag(newFlag) {
		const flag = newFlag;
		this.count += 1;
		this.last_id += 1;
		flag.id = this.last_id;
		this.flags_list.push(flag);

		return flag;
	},
	// get a specific order given the order's id, else return null
	getAFlag: function getAFlag(flagId) {
		const id = flagId;
		let theFlag = null;
		this.flags_list.map((flag) => {
			if (flag.id === id) theFlag = flag;
			return 0;
		});
		return theFlag;
	},
	// update a specific order in the orders list and return the new order object, else return null
	updateFlag: function updateFlag(flagId, flagToUpdate) {
		const id = flagId;
		let flagIndex = null;
		this.flags_list.map((flagItem, index) => {
			if (flagItem.id === id) flagIndex = index;
			return 0;
		});
		if (flagIndex === null) return null;

		this.flags_list.splice(flagIndex, 1, flagToUpdate);
		return flagToUpdate;
	},
	// delete a order from the orders list and return the courrent count value, else return null
	deleteFlag: function deleteFlag(flagId) {
		const id = flagId;
		let flagIndex = null;
		this.flags_list.map((flag, index) => {
			if (flag.id === id) flagIndex = index;
			return 0;
		});
		if (flagIndex === null) return null;

		this.flags_list.splice(flagIndex, 1);
		this.count -= 1;
		return this.count;
	},
};

module.exports = flags;
