import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const TableList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [role, setRole] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [paypalClientId, setPaypalClientId] = useState(null);

  const location = useLocation();
  const status = location.state?.status;
  const navigate = useNavigate();

  const defaultAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  // --- Initial Fetching ---
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Fetch User Role
        const roleRes = await axios.get(
          "https://service-provider-roan.vercel.app/api/v1/auth/fetchUserRole",
          { withCredentials: true }
        );
        if (roleRes.data.success) setRole(roleRes.data.userRole);

        // Fetch Bookings
        const bookingRes = await axios.post(
          "https://service-provider-roan.vercel.app/api/v1/booking/getBookingStatus",
          { status },
          { withCredentials: true }
        );
        setData(bookingRes.data.bookings || []);

        // Fetch PayPal Client ID
        const paypalRes = await axios.get(
          "https://service-provider-roan.vercel.app/api/v1/booking/getPaypalClientId"
        );
        if (paypalRes.data.clientId) setPaypalClientId(paypalRes.data.clientId);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [status]);

  const fetchBookings = async () => {
    try {
      const response = await axios.post(
        "https://service-provider-roan.vercel.app/api/v1/booking/getBookingStatus",
        { status },
        { withCredentials: true }
      );
      setData(response.data.bookings || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // --- Handlers ---
  const handleSave = async (bookingId) => {
    if (!selectedDate || !selectedTime)
      return toast.error("Provide date and time.");
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await axios.put(
        `https://service-provider-roan.vercel.app/api/v1/booking/updateStatus/${bookingId}`,
        {
          status: "accepted",
          timeSlot: { date: selectedDate, time: selectedTime },
        },
        { withCredentials: true }
      );
      toast.success("Approved");
      fetchBookings();
      setEditingRow(null);
    } catch (error) {
      toast.error("Failed to accept");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleComplete = async (bookingId) => {
    if (!window.confirm("Mark as complete?")) return;
    try {
      await axios.put(
        `https://service-provider-roan.vercel.app/api/v1/booking/updateStatus/${bookingId}`,
        { status: "completed" },
        { withCredentials: true }
      );
      toast.success("Completed");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to complete");
    }
  };

  const handleRating = async (bookingId, rating) => {
    try {
      await axios.post(
        "https://service-provider-roan.vercel.app/api/v1/booking/submitRating",
        { bookingId, rating },
        { withCredentials: true }
      );
      toast.success("Rated!");
      fetchBookings();
    } catch (error) {
      toast.error("Rating failed");
    }
  };

 if (!paypalClientId) return <Loader />;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": paypalClientId || "test",
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="min-h-screen w-full p-7 overflow-x-auto">
        {data.length === 0 ? (
          <p className="text-3xl text-center mt-20">No bookings found.</p>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-red/30">
                <th className="p-3">User</th>
                <th className="p-3">Service</th>
                <th className="p-3">TimeSlot</th>
                <th className="p-3">Status</th>
                {role === "customer" && (
                  <th className="p-3">Payment & Rating</th>
                )}
                {status === "accepted" && role === "provider" && (
                  <th className="p-3">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((booking, idx) => (
                <tr
                  key={booking.bookingId || idx}
                  className="border-b border-red/10"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.user?.avatar || defaultAvatar}
                        className="w-10 h-10 rounded-full"
                        alt="avatar"
                      />
                      <span>{booking.user?.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{(booking.services || []).join(", ")}</td>
                  <td className="p-3">{booking.timeSlot?.date || "Pending"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        booking.status === "accepted"
                          ? "bg-green-500"
                          : booking.status === "completed"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {/* PayPal Integration Section */}
                  {booking.status === "completed" && role === "customer" && (
                    <td className="p-3">
                      {!booking.paid ? (
                        <div className="w-44">
                          <PayPalButtons
                            forceReRender={[booking.bookingId, paypalClientId]}
                            style={{
                              layout: "horizontal",
                              height: 32,
                              label: "pay",
                              tagline: false,
                            }}
                            createOrder={async () => {
                              try {
                                const res = await axios.post(
                                  "https://service-provider-roan.vercel.app/api/v1/booking/createPaypalOrder",
                                  { bookingId: booking.bookingId },
                                  { withCredentials: true }
                                );
                                return res.data.id; // Must return the Order ID from PayPal
                              } catch (err) {
                                toast.error("Payment initiation failed");
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                const res = await axios.post(
                                  "https://service-provider-roan.vercel.app/api/v1/booking/capturePaypalOrder",
                                  {
                                    orderID: data.orderID,
                                    bookingId: booking.bookingId,
                                  },
                                  { withCredentials: true }
                                );
                                if (res.data.success) {
                                  toast.success("Paid Successfully");
                                  fetchBookings();
                                }
                              } catch (err) {
                                toast.error("Verification failed");
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => handleRating(booking.bookingId, n)}
                              className={
                                booking.rating >= n
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  )}

                  {/* Provider Action Section */}
                  {booking.status === "accepted" && role === "provider" && (
                    <td className="p-3">
                      <button
                        onClick={() => handleComplete(booking.bookingId)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default TableList;
