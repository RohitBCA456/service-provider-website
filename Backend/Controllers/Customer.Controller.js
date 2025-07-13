import { User } from "../Models/User.Model.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.utilities.js";
import { deleteFromCloudinaryByUrl } from "../utilities/DeleteFromCloudinary.Utilities.js";

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude, address } = req.body;
    const avatar = req.file?.path;

    console.log("Registering customer with data:", {
      name,
      email,
      password,
      latitude,
      longitude,
      address,
    });

    if (![name, email, password, latitude, longitude, address].every(Boolean)) {
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
      role: "customer",
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        address,
      },
      avatar: avatarUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Customer registered successfully.",
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    return res.status(500).json({
      message: "Internal server error while registering the customer.",
    });
  }
};

export const customerLogin = async (req, res) => {
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

    const isPasswordValid = await user.isCorrectPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = user.generateAuthToken();
    user.accessToken = token;
    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", user.accessToken, options)
      .json({
        success: true,
        message: "Login successful",
      });
  } catch (error) {
    console.error("Error during customer login:", error);
    return res.status(500).json({
      message: "Internal server error during login",
    });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, latitude, longitude, address } = req.body;
    const avatar = req.file?.path;

    const userId = req.user?.id;

    const customer = await User.findById(userId);
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (avatar) {
      await deleteFromCloudinaryByUrl(customer.avatar);
      const uploadResponse = await uploadOnCloudinary(avatar);
      customer.avatar = uploadResponse.secure_url;
    }

    customer.name = name || customer.name;
    customer.location = {
      ...customer.location,
      coordinates: [
        longitude || customer.location.coordinates[0],
        latitude || customer.location.coordinates[1],
      ],
      address: address || customer.location.address,
    };

    await customer.save();
    return res.json({ message: "Customer updated", customer });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating the customer." });
  }
};

export const logoutCustomer = async (req, res) => {
 try {
   const userId = req.user?.id;
 
   const customer = await User.findByIdAndUpdate(
     userId,
     {
       $unset: {
         accessToken: "",
       },
     },
     {
       new: true,
     }
   );
 
    if (!customer) {
     return res.status(404).json({
       success: false,
       message: "No user found",
     });
   }
 
   const options = {
     httpOnly: true,
     secure: true,
     sameSite: "None",
     path: "/",
   };
 
   return res.status(200).clearCookie("accessToken", options).json({
     success: true,
     message: "Logout Successfully",
   });
 
 } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging out'
    })
 }
};
