import { Booking } from "../Models/Booking.Model.js";
import { User } from "../Models/User.Model.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.utilities.js";
import { deleteFromCloudinaryByUrl } from "../utilities/DeleteFromCloudinary.Utilities.js";

export const registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      latitude,
      longitude,
      address,
      servicesOffered,
    } = req.body;

    const avatar = req.file?.path;

    console.log(`The local url is : ${avatar}`);
    console.log("Registering provider with data:", {
      name,
      email,
      password,
      latitude,
      longitude,
      address,
      servicesOffered,
    });

    if (
      ![
        name,
        email,
        password,
        latitude,
        longitude,
        address,
        servicesOffered,
      ].every(Boolean)
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
      role: "provider",
      servicesOffered,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        address,
      },
      avatar: avatarUrl,
    });

    return res
      .status(201)
      .json({ message: "Provider registered successfully" });
  } catch (err) {
    console.error("Error in registerProvider:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const providerLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await user.isCorrectPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = user.generateAuthToken();
//     user.accessToken = token;
//     await user.save();

//     const user_data = {
//       userRole: user.role,
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None",
//       path: "/",
//     };

//     return res.status(200).cookie("accessToken", token, options).json({
//       success: true,
//       message: "Provider logged in successfully",
//       user_data,
//     });
//   } catch (error) {
//     console.error("Error logging in provider:", error);
//     return res.status(500).json({
//       message: "Internal server error while logging in the provider.",
//     });
//   }
// };

export const getALLNearByProviders = async (req, res) => {
  try {
    const { lat, lng, service } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized: user ID missing" });
    }

    const activeBookings = await Booking.find({
      customerId,
      status: { $in: ["pending", "accepted"] },
    }).select("providerId");

    const bookedProviderIds = activeBookings
      .filter((b) => b.providerId)
      .map((b) => b.providerId.toString());

    const query = {
      role: "provider",
      availability: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000,
        },
      },
    };

    if (bookedProviderIds.length > 0) {
      query._id = { $nin: bookedProviderIds };
    }

    if (service && service.trim() !== "") {
      const servicesArray = service
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);

      if (servicesArray.length > 0) {
        query.servicesOffered = { $in: servicesArray };
      }
    }

    const providers = await User.find(query);
    return res.json(providers);
  } catch (error) {
    console.error("Error fetching nearby providers:", error);
    return res.status(500).json({
      message: "Internal server error while fetching nearby providers.",
    });
  }
};

export const getSingleProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.providerId);

    console.log(provider);

    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.json({ provider }); // wrap in an object
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error while fetching provider" });
  }
};

export const updateProviderProfile = async (req, res) => {
  try {
    let { name, servicesOffered, latitude, longitude, address } = req.body;

    const avatar = req.file?.path;

    if (![name, servicesOffered, latitude, longitude, address]) {
      return res.status(400).json({ message: "All fields are required." });
    }

    servicesOffered = servicesOffered.toLowerCase();

    const provider = await User.findById(req.user?.id);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ error: "Provider not found." });
    }

    if (avatar) {
      await deleteFromCloudinaryByUrl(provider.avatar);
      const uploadResponse = await uploadOnCloudinary(avatar);
      provider.avatar = uploadResponse.secure_url;
    }

    provider.name = name || provider.name;
    provider.servicesOffered = servicesOffered || provider.servicesOffered;
    provider.location = {
      ...provider.location,
      coordinates: [
        longitude || provider.location.coordinates[0],
        latitude || provider.location.coordinates[1],
      ],
      address: address || provider.location.address,
    };

    await provider.save();
    return res.json({ message: "Provider updated", provider });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error while provider profile update." });
  }
};

export const logoutProvider = async (req, res) => {
  try {
    const userId = req.user?.id;

    const provider = await User.findByIdAndUpdate(
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

    if (!provider) {
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
      message: "Internal server error while logging out",
    });
  }
};
