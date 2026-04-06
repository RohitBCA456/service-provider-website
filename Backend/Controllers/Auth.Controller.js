import { User } from "../Models/User.Model.js";
import { Message } from "../Models/Message.Model.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.utilities.js";
import { Resend } from "resend";
import { redisClient } from "../config/redis.config.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, latitude, longitude, address } =
      req.body;
    const avatar = req.file?.path;

    console.log("Registering customer with data:", {
      name,
      email,
      password,
      role,
      latitude,
      longitude,
      address,
    });

    if (
      ![name, email, password, role, latitude, longitude, address].every(
        Boolean,
      )
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let avatarUrl = "";

    if (avatar) {
      const uploadResponse = await uploadOnCloudinary(avatar);
      avatarUrl = uploadResponse?.secure_url || "";
    }

    await User.create({
      name,
      email,
      password,
      role: role,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        address,
      },
      avatar: avatarUrl,
    });

    return res.status(200).json({
      success: true,
      message: `${role} registered successfully.`,
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    return res.status(500).json({
      message: "Internal server error while registering the customer.",
    });
  }
};

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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const key = `userDetails:${userId}`;

    const cachedUser = await redisClient.get(key);

    if (cachedUser) {
      console.log("User details fetched from Redis cache");

      return res.status(200).json({
        success: true,
        user: JSON.parse(cachedUser),
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisClient.setEx(key, 3600, JSON.stringify(user));

    console.log("User details fetched from MongoDB and cached in Redis");

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
  const { cursor, limit = 20 } = req.query;
  const isFirstPage = !cursor;
  const cacheKey = `chat:${roomId}:latest`;

  try {
    if (isFirstPage) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    }

    const query = { roomId };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const response = {
      success: true,
      messages: messages.reverse(),
      nextCursor:
        messages.length > 0 ? messages[messages.length - 1].createdAt : null,
    };

    if (isFirstPage) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    const key = `currentUser:${userId}`;

    const cachedUser = await redisClient.get(key);

    if (cachedUser) {
      console.log("current user fetched from redis cache");

      return res.status(200).json({
        success: true,
        message: "current user fetched successfully",
        user: JSON.parse(cachedUser),
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.setEx(key, 3600, JSON.stringify(user));

    console.log("current user fetched from mongodb and cached in redis");

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    console.error("Error getting unread message count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { roomId, userId } = req.body;

  if (!roomId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing roomId or userId" });
  }

  try {
    await Message.updateMany(
      { roomId, receiverId: userId, isRead: false },
      { $set: { isRead: true } },
    );
    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Error updating isRead:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactMail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    const { error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      replyTo: email,
      to: process.env.MAIL_RECEIVER,
      subject: `New Message from ${name} - Service Finder`,
      html: `
        <h3>Contact Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(500).json({ message: "Failed to send message" });
    }

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Mail Error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
