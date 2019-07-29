import { Router } from 'express';

import flags from '../controllers/flags';
import validator from '../helpers/validators';

const router = Router();

// create a new flag on a speific car Ad
router.post('/flag',
	validator.validateToken,
	validator.validateNewFlagForm,
	flags.createNewFlag);

// get all flags on a car Ad with the car_id
router.get('/flag/:car_id',
	validator.validateToken,
	flags.getAllFlags);

// update the status of a flag on a car Ad to Addressed by an admin
router.patch('/flag/:flag_id/status',
	validator.validateToken,
	validator.validateAdmin1,
	flags.addressFlag);

// delete a flag with the given flag_id by an admin
router.delete('/flag/:flag_id',
	validator.validateToken,
	validator.validateAdmin1,
	flags.deleteFlag);

module.exports = router;
