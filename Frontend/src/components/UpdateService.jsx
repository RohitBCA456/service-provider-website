import React, { useEffect, useState } from "react";
import axios from "axios";

const UserServices = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(
          "https://service-provider-website.onrender.com/api/v1/auth/getCurrentUser",
          { withCredentials: true }
        );
        const fetchedUser = res.data.user;
        setUser(fetchedUser);
        setServices(fetchedUser.servicesOffered || []);
        setPricing(fetchedUser.Pricing || []);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDeletePair = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
    setPricing((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index, value) => {
    const updated = [...pricing];
    updated[index] = value;
    setPricing(updated);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        "https://service-provider-website.onrender.com/api/v1/providers/updateProvider",
        {
          name: user.name,
          servicesOffered: services,
          pricing: pricing,
          latitude: user.location?.coordinates?.[1] || 0,
          longitude: user.location?.coordinates?.[0] || 0,
          address: user.location?.address || "N/A",
        },
        { withCredentials: true }
      );
      alert("Updated successfully!");
      setEditIndex(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleAddPair = () => {
    if (!newService.trim() || !newPrice.trim()) {
      alert("Both service and price are required.");
      return;
    }
    setServices([...services, newService]);
    setPricing([...pricing, newPrice]);
    setNewService("");
    setNewPrice("");
  };

  if (!user)
    return <div className="text-center mt-10">Loading user data...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-12">
      <div className="max-w-4xl w-full bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10 tracking-wide">
          {user.name}'s Service Pricing
        </h2>

        {/* Existing services */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:shadow-md border border-gray-200 rounded-xl p-4 transition-all"
            >
              <div className="w-full md:w-1/3 text-center md:text-left mb-2 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  {service}
                </h3>
              </div>

              <div className="flex items-center gap-4 w-full md:w-1/3 justify-center">
                {editIndex === index ? (
                  <input
                    type="number"
                    value={pricing[index] || ""}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 text-center focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-700 font-medium text-lg">
                    ₹{pricing[index]}
                  </p>
                )}
              </div>

              <div className="flex gap-2 w-full md:w-1/3 justify-center md:justify-end">
                {editIndex === index ? (
                  <button
                    onClick={handleUpdate}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditIndex(index)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeletePair(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new service */}
        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Add New Service</h3>
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <input
              type="text"
              placeholder="New service"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAddPair}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all shadow-md"
            >
              ➕ Add
            </button>
          </div>
        </div>

        {/* Save all */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleUpdate}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Save All Changes 💾
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserServices;
