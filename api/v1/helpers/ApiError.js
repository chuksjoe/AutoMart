export default class ApiError extends Error {
	constructor(statusCode, message) {
		super(message);

		this.statusCode = statusCode;
		this.message = message;
	}

	sendError(res) {
		res.status(this.statusCode || 500)
		.send({
			status: this.statusCode || 500,
			error: this.message,
		});
	}
}
