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
      ![name, email, password, latitude, longitude, address, servicesOffered].every(Boolean)
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

    return res.status(201).json({ message: "Provider registered successfully" });
  } catch (err) {
    console.error("Error in registerProvider:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const providerLogin = async (req, res) => {
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

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", token, options)
      .json({
        success: true,
        message: "Provider logged in successfully",
        accessToken: token,
      });
  } catch (error) {
    console.error("Error logging in provider:", error);
    return res.status(500).json({
      message: "Internal server error while logging in the provider.",
    });
  }
};

export const getALLNearByProviders = async (req, res) => {
  try {
    const { lat, lng, service } = req.query;

    if (![lat, lng, service]) {
      return res
        .status(400)
        .json({ message: "Latitude, longitude, and service are required" });
    }

    const query = {
      role: "provider",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000, // 10km
        },
      },
    };

    if (service) {
      query.servicesOffered = service;
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
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.json(provider);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error while fetching provider" });
  }
};

export const updateProviderProfile = async (req, res) => {
  try {
    const { name, servicesOffered, latitude, longitude, address } = req.body;

    const avatar = req.file?.path;

    if (![name, servicesOffered, latitude, longitude, address]) {
      return res.status(400).json({ message: "All fields are required." });
    }

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

export const getProviderByServices = async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service name is required.",
      });
    }

    console.log("Service requested:", service);

    // Find users who have role 'provider' and offer this service
    const providers = await User.find({
      role: "provider",
      servicesOffered: { $in: [service] },
    });

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No provider found for this service.",
      });
    }

    console.log("Found providers:", providers);

    return res.status(200).json({
      success: true,
      message: "Providers found for the requested service.",
      providers,
    });
  } catch (error) {
    console.error("Error while listing providers for the service:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while listing providers.",
    });
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
      message: 'Internal server error while logging out'
    })
 }
};