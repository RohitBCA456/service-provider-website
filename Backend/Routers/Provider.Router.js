import { Router } from "express";
import {
  updateProviderProfile,
  getSingleProvider,
  getALLNearByProviders,
  logoutProvider,
  updateServicePair,
  deleteServicePair,
} from "../Controllers/Provider.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";
import { upload } from "../Middlewares/Multer.Middleware.js";

const router = Router();

router.put(
  "/updateProvider",
  authMiddleware,
  upload.single("avatar"),
  updateProviderProfile
);

router.get("/getProvider/:providerId", getSingleProvider);

router.get("/getAllNearByProviders", authMiddleware, getALLNearByProviders);

router.get("/logoutProvider", authMiddleware, logoutProvider);

router.put("/updateServicePairs", authMiddleware, updateServicePair);

router.delete("/deleteServicePairs", authMiddleware, deleteServicePair);

export default router;
