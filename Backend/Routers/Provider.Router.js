import Router from "express";
import {
  updateProviderProfile,
  getSingleProvider,
  getALLNearByProviders,
  logoutProvider,
  updateServicePair,
  deleteServicePair,
} from "../Controllers/Provider.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/updateProvider").put(authMiddleware, updateProviderProfile);
router.route("/getProvider/:providerId").get(getSingleProvider);
router
  .route("/getAllNearByProviders")
  .get(authMiddleware, getALLNearByProviders);
authMiddleware,
  router.route("/logoutProvider").get(authMiddleware, logoutProvider);
router.route("/updateServicePairs").put(authMiddleware, updateServicePair);
router.route("/deleteServicePairs").delete(authMiddleware, deleteServicePair);

export default router;
