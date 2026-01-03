import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../Models/User.Model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Read users JSON
const users = JSON.parse(
  fs.readFileSync("sampleData/users.json", "utf-8")
);

// 🔐 HASH PASSWORDS BEFORE INSERT
const hashedUsers = await Promise.all(
  users.map(async (user) => {
    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return {
        ...user,
        password: hashedPassword
      };
    }
    return user;
  })
);

// Optional: clear old users
await User.deleteMany();

// Insert hashed users
await User.insertMany(hashedUsers);

console.log("✅ Users seeded successfully with HASHED passwords");
process.exit();
