import { Router } from 'express'
import { authMiddleware } from '../Middlewares/Auth.Middleware.js';
import { bookProvider, getBookingStats, getBookingStatus, submitRating, updateStatus } from '../Controllers/Booking.Controller.js';

const router = Router();

router.route('/bookProvider').post(authMiddleware, bookProvider);
router.route('/getBookingStatus').post(authMiddleware, getBookingStatus);
router.route('/getBookingStats').get(authMiddleware, getBookingStats);
router.route('/updateStatus/:id').put(authMiddleware, updateStatus);
router.route('/submitRating').post(submitRating);

export default router;