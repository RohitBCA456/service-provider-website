import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    serviceName: {
      type: [String], // Array of service names
      required: true,
      validate: [(val) => val.length > 0, "At least one service is required"],
    },
    status: {
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
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
