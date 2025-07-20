import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";

const UserServices = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editService, setEditService] = useState("");
  const [editPrice, setEditPrice] = useState("");
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

  const handleDeletePair = async (index) => {
    try {
      await axios.delete(
        "https://service-provider-website.onrender.com/api/v1/providers/deleteServicePairs",
        {
          data: { index },
          withCredentials: true,
        }
      );
      const updatedServices = [...services];
      const updatedPricing = [...pricing];
      updatedServices.splice(index, 1);
      updatedPricing.splice(index, 1);
      setServices(updatedServices);
      setPricing(updatedPricing);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditService(services[index]);
    setEditPrice(pricing[index]);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        "https://service-provider-website.onrender.com/api/v1/providers/updateServicePairs",
        {
          index: editIndex,
          service: editService,
          price: editPrice,
        },
        { withCredentials: true }
      );

      const updatedServices = [...services];
      const updatedPricing = [...pricing];
      updatedServices[editIndex] = editService;
      updatedPricing[editIndex] = editPrice;
      setServices(updatedServices);
      setPricing(updatedPricing);
      setEditIndex(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleAddPair = async () => {
    if (!newService.trim() || !newPrice.trim()) {
      alert("Both service and price are required.");
      return;
    }
    try {
      await axios.put(
        "https://service-provider-website.onrender.com/api/v1/providers/updateProvider",
        {
          name: user.name,
          servicesOffered: newService,
          pricing: newPrice,
          latitude: user.location?.coordinates?.[1] || 0,
          longitude: user.location?.coordinates?.[0] || 0,
          address: user.location?.address || "N/A",
        },
        { withCredentials: true }
      );

      setServices([...services, newService]);
      setPricing([...pricing, newPrice]);
      setNewService("");
      setNewPrice("");
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  if (!user)
    return (
      <div className="text-center mt-10 text-lg">Loading user data...</div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br px-4 py-12">
      <div className="max-w-4xl w-full bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10 tracking-wide">
          {user.name}'s Service Pricing
        </h2>

        {/* Service list */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:shadow-md border border-gray-200 rounded-xl p-4 transition-all"
            >
              <div className="w-full md:w-1/3 text-center md:text-left mb-2 md:mb-0">
                {editIndex === index ? (
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="border rounded px-3 py-1 w-full text-gray-600"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service}
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-4 w-full md:w-1/3 justify-center">
                {editIndex === index ? (
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="border rounded px-3 py-1 w-28 text-center text-gray-600"
                  />
                ) : (
                  <p className="text-gray-700 font-medium text-lg">
                    ₹{pricing[index]}
                  </p>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-1/3 justify-center md:justify-end">
                {editIndex === index ? (
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <FaSave /> Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(index)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeletePair(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserServices;
