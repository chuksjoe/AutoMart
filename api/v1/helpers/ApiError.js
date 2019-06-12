export default class ApiError extends Error {
	constructor(statusCode, message) {
		super();

		this.statusCode = statusCode;
		this.message = message;
	}
}
