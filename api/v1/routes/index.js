import auth from './auth';
import cars from './cars';
import orders from './orders';
import flags from './flags';


export default (app, prefix) => {
	app.use(prefix, auth);
	app.use(prefix, cars);
	app.use(prefix, orders);
	app.use(prefix, flags);
};
