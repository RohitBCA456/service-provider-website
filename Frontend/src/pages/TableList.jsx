import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const TableList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const status = location.state?.status;

  const defaultAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
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

    fetchBookings();
  }, [status]);

  const renderButtons = (bookingId) => (
    <div className="flex gap-2">
      <button className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600">
        Accept
      </button>
      <button className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600">
        Reject
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full p-7">
      {loading ? (
        <p className="text-white text-3xl text-center mt-50">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-white text-3xl text-center mt-50">No bookings found.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/30">
              <th className="p-3">User</th>
              <th className="p-3 hidden md:table-cell">Service(s)</th>
              <th className="p-3 hidden md:table-cell">Email</th>
              <th className="p-3">Status</th>
              {status === "pending" && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((booking, idx) => (
              <tr key={idx} className="border-b border-white/10">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={booking.user?.avatar || defaultAvatar}
                    alt="avatar"
                    onError={(e) => (e.target.src = defaultAvatar)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{booking.user?.name || "User"}</span>
                </td>
                <td className="p-3 hidden md:table-cell">
                  {(booking.services || []).join(", ")}
                </td>
                <td className="p-3 hidden md:table-cell">
                  {booking.user?.email || "N/A"}
                </td>
                <td className="p-3">
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
                  <td className="p-3">{renderButtons(booking.bookingId)}</td>
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
