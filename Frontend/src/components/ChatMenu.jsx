import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "./Container";

const StackListActionMenu = () => {
  const [bookings, setBookings] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const fetchRole = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/auth/fetchUserRole",
        {
          withCredentials: true,
        }
      );
      setUserRole(res.data.userRole);
    } catch (err) {
      toast.error("Failed to fetch user role");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/booking/getBookingStatus",
        {},
        { withCredentials: true }
      );
      const valid = res.data.bookings?.filter((b) =>
        ["pending", "accepted"].includes(b.status)
      );
      setBookings(valid);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    fetchRole();
    fetchBookings();
  }, []);

  const extractInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Container>
      <div className="overflow-x-auto w-full min-h-screen">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-600 text-white text-sm font-medium">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Services</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const user = booking.user || {};
              return (
                <tr
                  key={booking.bookingId}
                  className="border-b border-gray-200 dark:border-zinc-700 transition"
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold cursor-pointer hover:scale-105 transition"
                    >
                      {extractInitials(user.name)}
                    </div>
                    <span className="text-sm font-medium">
                      {user.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email || "N/A"}</td>
                  <td className="px-4 py-3 capitalize text-sm">
                    {userRole === "customer" ? "Provider" : "Customer"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(booking.services || []).join(", ") || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        navigate(`/ChatRoom/${user.id}`, {
                          state: { id: user.id },
                        })
                      }
                      className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition ${
                        booking.status === "pending"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default StackListActionMenu;
