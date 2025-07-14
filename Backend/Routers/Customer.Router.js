import { Router } from "express";
import { registerCustomer, updateCustomerProfile, logoutCustomer } from "../Controllers/Customer.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";
import { upload } from "../Middlewares/Multer.Middleware.js";

const router = Router();

router.route('/registerCustomer').post(upload.single('avatar'), registerCustomer);
// router.route('/loginCustomer').post(customerLogin);
router.route('/updateCustomer').put(authMiddleware, updateCustomerProfile)
router.route('/logoutCustomer').get(authMiddleware, logoutCustomer);

export default router;