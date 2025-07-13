import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, enum: ["customer", "provider"], required: true },

    avatar: {
      type: String,
    },

    rating: {
      type: Number, // for provider only
      default: 0,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },

    servicesOffered: [String], // For providers only
    availability: { type: Boolean, default: true }, // For providers
    createdAt: { type: Date, default: Date.now },

    accessToken: String, // For authentication
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const User = mongoose.model("User", userSchema);
