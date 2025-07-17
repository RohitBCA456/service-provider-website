import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const TableList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const location = useLocation();
  const status = location.state?.status;

  const defaultAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/v1/booking/getBookingStatus",
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
    fetchBookings();
  }, [status]);

  const handleSave = async (bookingId) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please provide both date and time.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/v1/booking/updateStatus/${bookingId}`,
        {
          status: "accepted",
          timeSlot: {
            date: selectedDate,
            time: selectedTime,
          },
        },
        { withCredentials: true }
      );

      setEditingRow(null);
      setSelectedDate("");
      setSelectedTime("");
      toast.success('Approved')
      fetchBookings();
    } catch (error) {
      console.error("Error accepting booking:", error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/v1/booking/updateStatus/${bookingId}`,
        { status: "rejected" },
        { withCredentials: true }
      );
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  const renderButtons = (bookingId, idx) => {
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
            className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:from-blue-600 hover:to-indigo-700 transition duration-200 shadow-md"
            onClick={() => handleSave(bookingId)}
          >
            Save Slot
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600"
          onClick={() => setEditingRow(idx)}
        >
          Accept
        </button>
        <button
          className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
          onClick={() => handleReject(bookingId)}
        >
          Reject
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full p-7">
      {loading ? (
        <p className="text-white text-3xl text-center mt-20">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-3xl text-center mt-20">
          No bookings found.
        </p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/30">
              <th className="p-3">User</th>
              <th className="p-3 hidden md:table-cell">Service(s)</th>
              <th className="p-3 hidden md:table-cell">Email</th>
              {status === "accepted" && <th className="p-3">TimeSlot</th>}
              <th className="p-3">Status</th>
              {status === "pending" && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((booking, idx) => {
              console.log("🔍 Booking:", booking);
              return (
                <tr key={idx} className="border-b border-white/10 align-middle">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.user?.avatar || defaultAvatar}
                        alt="avatar"
                        onError={(e) => (e.target.src = defaultAvatar)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{booking.user?.name || "User"}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell align-middle">
                    {(booking.services || []).join(", ")}
                  </td>
                  <td className="p-3 hidden md:table-cell align-middle">
                    {booking.user?.email || "N/A"}
                  </td>

                  {/* TimeSlot shown in separate column if accepted */}
                  {status === "accepted" && (
                    <td className="p-3 align-middle">
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
                  )}

                  <td className="p-3 align-middle">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${
                        booking.status === "accepted"
                          ? "bg-green-500"
                          : booking.status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {status === "pending" && (
                    <td className="p-3 align-middle">
                      {renderButtons(booking.bookingId, idx)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TableList;
