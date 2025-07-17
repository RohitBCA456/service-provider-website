import { Router } from 'express'
import { authMiddleware } from '../Middlewares/Auth.Middleware.js';
import { bookProvider, getBookingStatus } from '../Controllers/Booking.Controller.js';

const router = Router();

router.route('/bookProvider').post(authMiddleware, bookProvider);
router.route('/getBookingStatus').post(authMiddleware, getBookingStatus);

export default router;