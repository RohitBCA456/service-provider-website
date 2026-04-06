import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied, no token provided",
      });
    }

    // console.log("Received token:", token);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("Decoded token:", decodedToken);

    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = {
      id: decodedToken.id,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
