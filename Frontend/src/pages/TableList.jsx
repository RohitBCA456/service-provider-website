import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const TableList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [role, setRole] = useState(null);
  const [completedChecks, setCompletedChecks] = useState({});
  const [ratedBookings, setRatedBookings] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const location = useLocation();
  const status = location.state?.status;
  const navigate = useNavigate();

  const defaultAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(
        "https://service-provider-website.onrender.com/api/v1/auth/fetchUserRole",
        { withCredentials: true }
      );
      if (response.data.success) {
        setRole(response.data.userRole);
      }
    } catch (error) {
      console.log(`Error occured while fetching user role ${error.message}`);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://service-provider-website.onrender.com/api/v1/booking/getBookingStatus",
        { status },
        { withCredentials: true }
      );
      setData(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchBookings();
  }, [status]);

  const handleSave = async (bookingId) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please provide both date and time.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await axios.put(
        `https://service-provider-website.onrender.com/api/v1/booking/updateStatus/${bookingId}`,
        {
          status: "accepted",
          timeSlot: {
            date: selectedDate,
            time: selectedTime,
          },
        },
        { withCredentials: true }
      );
      toast.success("Approved");
      fetchBookings();
      setEditingRow(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleReject = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await axios.put(
        `https://service-provider-website.onrender.com/api/v1/booking/updateStatus/${bookingId}`,
        { status: "rejected" },
        { withCredentials: true }
      );
      toast.success("Rejected");
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleComplete = async (e, bookingId) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this as complete?"
    );

    if (!confirmComplete) {
      setCompletedChecks((prev) => ({
        ...prev,
        [bookingId]: false,
      }));
      return;
    }

    try {
      await axios.put(
        `https://service-provider-website.onrender.com/api/v1/booking/updateStatus/${bookingId}`,
        { status: "completed" },
        { withCredentials: true }
      );
      toast.success("Appointment Completed");

      setCompletedChecks((prev) => ({
        ...prev,
        [bookingId]: true,
      }));

      fetchBookings();
    } catch (error) {
      console.error("Error marking complete:", error);
      toast.error("Failed to mark as completed");
    }
  };

  const handleRating = async (bookingId, ratingValue) => {
    try {
      await axios.post(
        "https://service-provider-website.onrender.com/api/v1/booking/submitRating",
        { bookingId, rating: ratingValue },
        { withCredentials: true }
      );
      toast.success("Thank you for rating!");
      await fetchBookings();
    } catch (error) {
      toast.error("Failed to submit rating.");
      console.error("Rating error:", error);
    }
  };

  const renderButtons = (bookingId, idx) => {
    if (role !== "provider") return null;

    if (editingRow === idx) {
      return (
        <div className="flex flex-col gap-2 p-3 bg-white rounded-xl shadow-md w-72">
          <label className="text-sm font-medium text-gray-700">
            Select Date
          </label>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <label className="text-sm font-medium text-gray-700 mt-1">
            Select Time
          </label>
          <input
            type="time"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
          <button
            disabled={actionLoading[bookingId]}
            className={`mt-3 px-4 py-2 rounded-md font-semibold shadow-md transition duration-200 text-white ${
              actionLoading[bookingId]
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            }`}
            onClick={() => handleSave(bookingId)}
          >
            {actionLoading[bookingId] ? "Saving..." : "Save Slot"}
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600 disabled:opacity-50"
          onClick={() => setEditingRow(idx)}
          disabled={actionLoading[bookingId]}
        >
          {actionLoading[bookingId] ? "Loading..." : "Accept"}
        </button>
        <button
          className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 disabled:opacity-50"
          onClick={() => handleReject(bookingId)}
          disabled={actionLoading[bookingId]}
        >
          {actionLoading[bookingId] ? "..." : "Reject"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full p-7 overflow-x-auto">
      {loading ? (
        <Loader />
      ) : data.length === 0 ? (
        <p className="text-3xl text-center mt-20">No bookings found.</p>
      ) : (
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/30">
              <th className="p-3">User</th>
              <th className="p-3 md:table-cell">Service(s)</th>
              <th className="p-3 md:table-cell">Email</th>
              <th className="p-3">TimeSlot</th>
              <th className="p-3">Status</th>
              {status === "completed" && role === "customer" && (
                <th className="p-3">Rate</th>
              )}
              {status === "accepted" && role === "provider" && (
                <th className="p-3">Complete</th>
              )}
              {status === "pending" && role === "provider" && (
                <th className="p-3">Actions</th>
              )}
              {role === "customer" && <th className="p-3">Rating</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((booking, idx) => (
              <tr key={idx} className="border-b border-white/10 align-middle">
                <td className="p-3 min-w-[180px] whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      onClick={() => {
                        if (role === "customer") {
                          navigate("/Profile", {
                            state: { providerId: booking.user?.id },
                          });
                        }
                      }}
                      src={booking.user?.avatar || defaultAvatar}
                      alt="avatar"
                      onError={(e) => (e.target.src = defaultAvatar)}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {booking.user?.name || "User"}
                    </span>
                  </div>
                </td>
                <td className="p-3 md:table-cell align-middle">
                  {(booking.services || []).join(", ")}
                </td>
                <td className="p-3 md:table-cell align-middle">
                  {booking.user?.email || "N/A"}
                </td>
                <td className="p-3 min-w-[200px] whitespace-nowrap align-middle">
                  {booking.timeSlot?.date && booking.timeSlot?.time ? (
                    <div className="text-sm text-green-600 font-medium">
                      {new Date(
                        `${booking.timeSlot.date}T${booking.timeSlot.time}`
                      ).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-red-400 italic">
                      No slot assigned
                    </span>
                  )}
                </td>
                <td className="p-3 align-middle">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${
                      booking.status === "accepted"
                        ? "bg-green-500"
                        : booking.status === "rejected"
                        ? "bg-red-500"
                        : booking.status === "completed"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>

                {booking.status === "completed" && role === "customer" && (
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleRating(booking.bookingId, n)}
                          disabled={!!booking.rating}
                          className={`text-xl transition-colors duration-200 ${
                            booking.rating >= n
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } ${!booking.rating ? "hover:text-yellow-500" : ""}`}
                        >
                          ★
                        </button>
                      ))}
                      {booking.rating && (
                        <span className="ml-2 text-green-500 text-sm font-medium mt-1">
                          Rated ({booking.rating})
                        </span>
                      )}
                    </div>
                  </td>
                )}

                {status === "accepted" && role === "provider" && (
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!completedChecks[booking.bookingId]}
                      onChange={(e) => handleComplete(e, booking.bookingId)}
                      className="w-4 h-4 mr-10 accent-green-500 cursor-pointer"
                    />
                  </td>
                )}

                {status === "pending" && role === "provider" && (
                  <td className="p-3 align-middle">
                    {renderButtons(booking.bookingId, idx)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TableList;
