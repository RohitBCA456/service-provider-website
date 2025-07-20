import { Booking } from "../Models/Booking.Model.js";
import { User } from "../Models/User.Model.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.utilities.js";

export const getALLNearByProviders = async (req, res) => {
  try {
    const { lat, lng, service } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
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
    let { name, latitude, longitude, address } =
      req.body;

    const avatar = req.file?.path;

    const provider = await User.findById(req.user?.id);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ error: "Provider not found." });
    }

    if (avatar) {
      const uploadResponse = await uploadOnCloudinary(avatar);
      provider.avatar = uploadResponse.secure_url;
    }

    provider.name = name || provider.name;
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
    console.log(error);
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

export const updateServicePair = async (req, res) => {
  try {
    const { index, service, price } = req.body;

    if (index === undefined || !service || !price) {
      return res
        .status(400)
        .json({ message: "Index, service, and price are required." });
    }

    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "provider") {
      return res.status(404).json({ message: "Provider not found." });
    }

    if (!Array.isArray(user.servicesOffered) || !Array.isArray(user.Pricing)) {
      return res
        .status(400)
        .json({ message: "Service or pricing list is invalid." });
    }

    if (index < 0 || index >= user.servicesOffered.length) {
      return res.status(400).json({ message: "Invalid index." });
    }

    user.servicesOffered[index] = service.toLowerCase();
    user.Pricing[index] = price;

    await user.save();

    return res
      .status(200)
      .json({
        message: "Service and pricing updated",
        services: user.servicesOffered,
        pricing: user.Pricing,
      });
  } catch (error) {
    console.error("Error updating service pair:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteServicePair = async (req, res) => {
  try {
    const { index } = req.body;

    if (index === undefined) {
      return res.status(400).json({ message: "Index is required." });
    }

    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "provider") {
      return res.status(404).json({ message: "Provider not found." });
    }

    if (index < 0 || index >= user.servicesOffered.length) {
      return res.status(400).json({ message: "Invalid index." });
    }

    user.servicesOffered.splice(index, 1);
    user.Pricing.splice(index, 1);

    await user.save();

    return res
      .status(200)
      .json({
        message: "Service and pricing deleted",
        services: user.servicesOffered,
        pricing: user.Pricing,
      });
  } catch (error) {
    console.error("Error deleting service pair:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
