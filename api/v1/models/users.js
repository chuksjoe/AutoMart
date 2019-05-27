import util from '../util';

// sample user
const usersList = [
	{
		id: 1,
		token: util.getToken(),
		first_name: 'ChuksJoe',
		last_name: 'Orjiakor',
		email: 'chuksjoe@live.com',
		password: util.hashPassword('testing', 3),
		is_admin: true,
		address: {
			street: '15 Aborishade road, Lawanson',
			city: 'Surulere',
			state: 'Lagos',
			country: 'Nigeria',
		},
		phone: '08131172617',
		zip: '234-001',
		registered_on: Date(),
	},
];

const users = {
	last_id: 1,
	count: 1,
	users_list: usersList,

	// get list of all registered Users
	getAllUsers() {
		return this.users_list;
	},

	// add a new user into the users list
	createNewUser(newUser) {
		const user = newUser;
		this.count += 1;
		this.last_id += 1;
		user.id = this.last_id;
		this.users_list.push(user);
		return newUser;
	},
	// get a specific user given the user's email and return the users details, else return null
	getAUserByEmail(userEmail) {
		const email = userEmail;
		let theUser = null;
		this.users_list.map((user) => {
			if (user.email === email) theUser = user;
			return 0;
		});
		return theUser;
	},
	// get a specific user given the user's id and return the users details, else return null
	getAUserById(userId) {
		const id = userId;
		let theUser = null;
		this.users_list.map((user) => {
			if (user.id === id) theUser = user;
			return 0;
		});
		return theUser;
	},
	// update a specific user in the Users list and return the new user object, else return null
	updateAUser(userId, userToUpdate) {
		const id = userId;
		let userIndex = null;
		this.users_list.map((userItem, index) => {
			if (userItem.id === id) userIndex = index;
			return 0;
		});
		if (userIndex === null) return null;

		this.users_list.splice(userIndex, 1, userToUpdate);
		return userToUpdate;
	},
	// delete a car from the Users list and return the courrent count value, else return null
	deleteAUser(userId) {
		const id = userId;
		let userIndex = null;
		this.users_list.map((user, index) => {
			if (user.id === id) userIndex = index;
			return 0;
		});
		if (userIndex === null) return null;

		this.users_list.splice(userIndex, 1);
		this.count -= 1;
		return this.count;
	},
};

module.exports = users;
