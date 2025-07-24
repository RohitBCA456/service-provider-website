import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const ProviderProfile = () => {
  const location = useLocation();
  const providerId = location.state?.providerId;
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const fallbackAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  useEffect(() => {
    const subscribeToPush = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Push not supported in this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      await fetch(
        "https://service-provider-website.onrender.com/api/v1/providers/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ providerId, subscription }),
        }
      );
    };

    if (providerId) subscribeToPush();
  }, [providerId]);

  const handleBooking = async (providerId, selectedService) => {
    const servicesArray = selectedService
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setBookingInProgress(true); // Start booking

    try {
      const res = await fetch(
        "https://service-provider-website.onrender.com/api/v1/booking/bookProvider",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ providerId, services: servicesArray }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Booking Successfull");
      navigate("/Home");
    } catch (err) {
      console.log(err);
      toast.error("Booking failed");
    } finally {
      setBookingInProgress(false); // End booking
      setSelectedService("");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!provider) return <div className="p-6">Provider not found.</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br light:from-white via-slate-100 to-slate-200 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <div className="flex flex-col md:flex-row items-start gap-8">
          <img
            src={provider.avatar || fallbackAvatar}
            alt="avatar"
            className="w-40 h-40 rounded-full object-cover border-4 border-purple-500 shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              {provider.name}
            </h1>
            <p className="text-gray-600">{provider.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              📍 {provider.location?.address || "No address available"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Rating: {provider.rating || 0} / 5
              </span>
              <span
                className={`${
                  provider.availability
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                } px-3 py-1 rounded-full text-sm font-medium`}
              >
                {provider.availability ? "✅ Available" : "❌ Not Available"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-purple-500 border-gray-300">
            🛠 Services Offered
          </h2>
          {Array.isArray(provider.servicesOffered) &&
          provider.servicesOffered.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.servicesOffered.map((service, i) => (
                <li
                  key={i}
                  className="bg-slate-50 border text-blue-400 shadow-sm p-4 rounded-lg hover:shadow-md transition"
                >
                  <div className="font-semibold">{service}</div>
                  <div className="text-sm text-green-400">
                    ₹
                    {provider.Pricing && provider.Pricing[i]
                      ? provider.Pricing[i]
                      : "N/A"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No services listed.</p>
          )}
        </div>

        <div className="mt-10 border-t border-gray-900 pt-6 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            value={selectedService}
            required
            onChange={(e) => setSelectedService(e.target.value)}
            placeholder="Enter services (comma-separated)"
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={() => handleBooking(providerId, selectedService)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold disabled:opacity-50"
            disabled={bookingInProgress}
          >
            {bookingInProgress ? "⏳ Booking..." : "🚀 Book Now"}
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-right">
          🗓 Registered on:{" "}
          {provider.createdAt
            ? new Date(provider.createdAt).toLocaleDateString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
