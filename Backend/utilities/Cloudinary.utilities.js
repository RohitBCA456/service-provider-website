import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load env vars early
dotenv.config();

// Use standard Cloudinary keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Debug: confirm actual values passed to Cloudinary
console.log("✅ Cloudinary final config:", cloudinary.config());

const uploadOnCloudinary = async (localFilePath) => {
  console.log("📦 Uploading file:", localFilePath);
  console.log("🌐 Cloudinary ENV:", {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET ? "✔️ Loaded" : "❌ Missing",
  });

  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      timeout: 120000, // 2 minutes
    });

    // Delete local file only after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.log("✅ Cloudinary upload success:", response.secure_url);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message || error);
    return null;
  }
};

export { uploadOnCloudinary };
