import { User } from "../Models/User.Model.js";

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
    }

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