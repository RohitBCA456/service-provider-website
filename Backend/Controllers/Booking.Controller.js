import { Booking } from "../Models/Booking.Model.js";
import { User } from "../Models/User.Model.js";
import { Message } from "../Models/Message.Model.js";
import moment from "moment";
import axios from "axios";

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

    const userIdsToFetch = bookings.map((b) =>
      role === "customer" ? b.providerId : b.customerId,
    );

    const users = await User.find(
      { _id: { $in: userIdsToFetch } },
      "avatar email name",
    ).lean();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    const roomQueries = bookings.map((b) => {
      const targetId = role === "customer" ? b.providerId : b.customerId;
      const sortedIds = [userId, targetId.toString()].sort();
      return {
        roomId: sortedIds.join("-"),
        receiverId: userId,
      };
    });

    const unreadCounts = await Promise.all(
      roomQueries.map(({ roomId, receiverId }) =>
        Message.countDocuments({
          roomId,
          receiverId,
          isRead: false,
        }),
      ),
    );

    const formatted = bookings.map((booking, index) => {
      const targetId =
        role === "customer" ? booking.providerId : booking.customerId;

      const userData = userMap[targetId.toString()] || {};

      return {
        bookingId: booking._id,
        status: booking.status,
        services: booking.serviceName,
        timeSlot: booking.timeSlot || null,
        rating: booking.rating || null,
        paid: booking.paid || false,
        payment: booking.payment || null,
        unreadCount: unreadCounts[index],
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
      unreadRoomsCount: 0,
    };

    const unreadMessages = await Message.find({
      receiverId: userId,
      isRead: false,
    }).select("senderId roomId");

    const roomSet = new Set();

    for (let msg of unreadMessages) {
      const booking = await Booking.findOne({
        $or: [
          { customerId: userId, providerId: msg.senderId },
          { providerId: userId, customerId: msg.senderId },
        ],
        status: { $ne: "rejected" }, 
      });

      if (booking) {
        roomSet.add(msg.roomId);
      }
    }

    stats.unreadRoomsCount = roomSet.size;

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
    user.availability = ["pending", "completed", "rejected"].includes(status);
    await user.save({ validateBeforeSave: false });

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, timeSlot },
      { new: true },
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getPaypalAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const response = await axios({
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    method: "post",
    data: "grant_type=client_credentials",
    headers: { Authorization: `Basic ${auth}` },
  });
  return response.data.access_token;
};

export const createPaypalOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const provider = await User.findById(booking.providerId);
    if (!provider)
      return res.status(404).json({ message: "Provider not found" });

    let totalAmount = 0;
    const inrToUsd = parseFloat(process.env.INR_TO_USD_RATE) || 0.012;

    if (provider.servicesOffered && provider.Pricing) {
      booking.serviceName.forEach((bookedService) => {
        const serviceIndex = provider.servicesOffered.findIndex(
          (s) =>
            s?.trim().toLowerCase() === bookedService?.trim().toLowerCase(),
        );
        if (serviceIndex !== -1 && provider.Pricing[serviceIndex] != null) {
          const priceInUsd = parseFloat(
            (provider.Pricing[serviceIndex] * inrToUsd).toFixed(2),
          );
          totalAmount += priceInUsd;
        } else {
          console.warn(`Price not found for service: "${bookedService}"`);
        }
      });
    }

    console.log("Calculated Total Amount:", totalAmount);

    if (totalAmount <= 0) {
      return res.status(400).json({
        error: "Total amount must be greater than zero.",
      });
    }

    const accessToken = await getPaypalAccessToken();

    const response = await axios({
      url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      method: "post",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: bookingId.toString(),
            amount: {
              currency_code: "USD",
              value: totalAmount.toFixed(2),
            },
            description: `Services: ${booking.serviceName.join(", ")}`,
          },
        ],
      },
    });

    res.status(200).json({ id: response.data.id });
  } catch (error) {
    console.error("PayPal Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

export const capturePaypalOrder = async (req, res) => {
  try {
    const { orderID, bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.paid) {
      return res
        .status(200)
        .json({ success: true, message: "Already processed" });
    }

    const accessToken = await getPaypalAccessToken();

    const captureResponse = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      method: "post",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (captureResponse.data.status === "COMPLETED") {
      const totalAmount = parseFloat(
        captureResponse.data.purchase_units[0].payments.captures[0].amount
          .value,
      );
      const providerAmount = (totalAmount * 0.9).toFixed(2);

      const provider = await User.findById(booking.providerId);
      console.log(
        "Paying out to:",
        provider.paypalEmail,
        "Amount:",
        providerAmount,
      );

      await axios({
        url: "https://api-m.sandbox.paypal.com/v1/payments/payouts",
        method: "post",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          sender_batch_header: {
            sender_batch_id: `payout_${bookingId}_${Date.now()}`,
            email_subject: "You have a payout!",
            recipient_type: "EMAIL",
          },
          items: [
            {
              recipient_wallet: "PAYPAL",
              amount: {
                value: providerAmount,
                currency: "USD",
              },
              note: `Payment for booking ${bookingId}`,
              receiver: provider.paypalEmail,
            },
          ],
        },
      });

      booking.paid = true;
      booking.payoutStatus = "initiated";
      await booking.save();

      return res
        .status(200)
        .json({ success: true, data: captureResponse.data });
    }

    res.status(400).json({ error: "Payment not captured" });
  } catch (error) {
    console.error("Capture Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to complete transaction" });
  }
};

export const getPaypalClientId = async (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || null;
    return res.status(200).json({ clientId });
  } catch (err) {
    console.error("Error fetching PayPal client id:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const submitRating = async (req, res) => {
  try {
    const { bookingId, rating } = req.body;

    if (!bookingId || !rating)
      return res
        .status(400)
        .json({ message: "Booking ID and rating required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "completed")
      return res
        .status(400)
        .json({ message: "Can only rate completed appointments" });

    if (!booking.paid)
      return res
        .status(400)
        .json({ message: "Payment required before rating" });

    if (booking.rating) {
      return res.status(400).json({ message: "Booking already rated" });
    }

    booking.rating = parseFloat(rating);
    await booking.save();

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

export const getBookingChartData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter = {};
    if (role === "provider") {
      filter.providerId = userId;
    } else if (role === "customer") {
      filter.customerId = userId;
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(moment().subtract(i, "days").startOf("day"));
    }

    const dailyCounts = dates.map((date) => ({
      date: date.format("YYYY-MM-DD"),
      bookings: 0,
    }));

    const startDate = moment().subtract(6, "days").startOf("day").toDate();
    const endDate = moment().endOf("day").toDate();

    const bookings = await Booking.find({
      ...filter,
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    for (const booking of bookings) {
      const day = moment(booking.createdAt).format("YYYY-MM-DD");
      const found = dailyCounts.find((d) => d.date === day);
      if (found) found.bookings++;
    }

    return res.status(200).json({ weeklyData: dailyCounts });
  } catch (err) {
    console.error("Chart Data Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
