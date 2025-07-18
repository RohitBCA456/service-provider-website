import { User } from "../Models/User.Model.js";
import { Message } from "../Models/Message.Model.js";

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.isCorrectPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = user.generateAuthToken();
    user.accessToken = token;
    await user.save();

    const user_data = {
      userRole: user.role,
    };

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    return res.status(200).cookie("accessToken", token, options).json({
      success: true,
      message: "Provider logged in successfully",
      user_data,
    });
  } catch (error) {
    console.error("Error logging in provider:", error);
    return res.status(500).json({
      message: "Internal server error while logging in the provider.",
    });
  }
};

export const fetchUserRole = async (req, res) => {
  const userRole = req.user?.role;
  if (!userRole) {
    return res.status(404).json({
      success: false,
      message: "User Role Not Found.",
    });
  }
  return res.status(200).json({
    success: true,
    message: "User Role Fetched Successfully",
    userRole,
  });
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getChatHistory = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  try {
    const messages = await Message.find({ roomId }).sort("createdAt");
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
