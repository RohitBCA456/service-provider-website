import { Booking } from "../Models/Booking.Model.js";
import { User } from "../Models/User.Model.js";

export const bookProvider = async (req, res) => {
  const providerId = req.body.providerId;
  const services = req.body.services;
  const customerId = req.user?.id;

  if (!services || !providerId) {
    return res.status(400).json({
      success: false,
      message: "Missing credentials",
    });
  }

  const provider = await User.findById(providerId);

  if (!provider) {
    return res.status(404).json({
      success: false,
      message: "Provider not found",
    });
  }

  const newBooking = await Booking.create({
    serviceName: services,
    customerId,
    providerId,
  });

  if (newBooking) {
    return res.status(200).json({
      success: true,
      message: "Booking successfull",
      newBooking,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error while booking",
  });
};

export const getBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!userId || !role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter = {
      status: status.toLowerCase(),
    };

    if (role === "customer") {
      filter.customerId = userId;
    } else if (role === "provider") {
      filter.providerId = userId;
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const bookings = await Booking.find(filter).lean();

    // Collect all user IDs to fetch (provider or customer based on role)
    const userIdsToFetch = bookings.map((b) =>
      role === "customer" ? b.providerId : b.customerId
    );

    // Fetch user details manually
    const users = await User.find(
      { _id: { $in: userIdsToFetch } },
      "avatar email name"
    ).lean();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    const formatted = bookings.map((booking) => {
      const targetId =
        role === "customer" ? booking.providerId : booking.customerId;

      const userData = userMap[targetId.toString()] || {};

      return {
        bookingId: booking._id,
        status: booking.status,
        services: booking.serviceName,
        timeSlot: booking.timeSlot || null, // ✅ INCLUDE TIME SLOT
        user: {
          id: targetId,
          avatar: userData.avatar || null,
          email: userData.email || null,
          name: userData.name || "Unknown",
        },
        canDelete: role === "customer" && booking.status === "pending",
      };
    });

    res.status(200).json({ bookings: formatted });
  } catch (error) {
    console.error("Error fetching booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let filter = {};
    if (role === "customer") {
      filter.customerId = userId;
    } else if (role === "provider") {
      filter.providerId = userId;
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const allBookings = await Booking.find(filter);

    const stats = {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      accepted: allBookings.filter((b) => b.status === "accepted").length,
      rejected: allBookings.filter((b) => b.status === "rejected").length,
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status, timeSlot } = req.body;
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, timeSlot },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
