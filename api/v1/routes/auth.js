import { Router } from 'express';

import auth from '../controllers/auth';
import validator from '../helpers/validators';

const router = Router();

// create new user account
router
	.post('/auth/signup', validator.validateUserRegForm, auth.createNewUser)
	// sign in a registered user
	.post('/auth/signin', validator.validateUserSignin, auth.signinUser)
	// reset a users' password
	.post(
		'/user/:email/reset_password',
		validator.validatePasswordReset,
		auth.resetPassword,
	);

// get the list of all registered users
router
	.get(
		'/user',
		validator.validateToken,
		validator.validateAdmin1,
		auth.getAllUsers,
	)
	// get a specific user with the given user_id
	.get('/user/:user_id', validator.validateToken, auth.getAUser);

// update a users' details
router.patch(
	'/user/:email/update_details',
	validator.validateToken,
	auth.updateUserDetails,
);

// delete a users' account
router.delete('/user/:email', validator.validateToken, auth.deleteUser);

module.exports = router;
