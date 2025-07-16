import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    serviceName: {
      type: [String], // Array of service names
      required: true,
      validate: [(val) => val.length > 0, "At least one service is required"],
    },
    booking: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
