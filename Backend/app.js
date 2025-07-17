import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import customerRouter from "./Routers/Customer.Router.js";
import providerRouter from "./Routers/Provider.Router.js";
import bookingRouter from "./Routers/Booking.Router.js";
import authRouter from "./Routers/Auth.Router.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/providers", providerRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/auth", authRouter);

export { app };
