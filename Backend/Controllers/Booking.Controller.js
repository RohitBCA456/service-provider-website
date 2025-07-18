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

    if (!userId || !role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter = {};

    if (status) {
      filter.status = status.toLowerCase();
    }

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
        timeSlot: booking.timeSlot || null,
        rating: booking.rating || null,
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

    const user = await User.findById(req.user?.id);
    user.availability = !status || status === "completed";
    await user.save({ validateBeforeSave: false });

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

export const submitRating = async (req, res) => {
  try {
    const { bookingId, rating } = req.body;

    if (!bookingId || !rating)
      return res
        .status(400)
        .json({ message: "Booking ID and rating required" });

    // 1. Fetch the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "completed")
      return res
        .status(400)
        .json({ message: "Can only rate completed appointments" });

    if (booking.rating) {
      return res.status(400).json({ message: "Booking already rated" });
    }

    // 2. Save rating inside booking
    booking.rating = parseFloat(rating);
    await booking.save();

    // 3. Update provider rating in User model
    const provider = await User.findById(booking.providerId);
    if (!provider)
      return res.status(404).json({ message: "Provider not found" });

    const currentRating = provider.rating || 0;
    const currentReviewCount = provider.review || 0;

    const newReviewCount = currentReviewCount + 1;
    const newRating =
      (currentRating * currentReviewCount + parseFloat(rating)) /
      newReviewCount;

    provider.rating = parseFloat(newRating.toFixed(1));
    provider.review = newReviewCount;
    await provider.save();

    return res.status(200).json({
      message: "Rating submitted successfully",
      bookingRating: booking.rating,
      providerNewAverage: newRating.toFixed(1),
      totalReviews: newReviewCount,
    });
  } catch (err) {
    console.error("Rating Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
