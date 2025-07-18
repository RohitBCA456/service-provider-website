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
      enum: ["accepted", "rejected", "pending", "completed"],
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
    timeSlot: {
      date: {
        type: String, // or Date if you want to convert later
      },
      time: {
        type: String, // e.g. "14:30"
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
