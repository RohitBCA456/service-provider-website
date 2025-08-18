import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "./Loader"; // Assuming Loader component exists

const UserServices = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editService, setEditService] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingIndex, setIsDeletingIndex] = useState(null);
  const [isEditingIndex, setIsEditingIndex] = useState(null);

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
        toast.error("Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDeletePair = async (index) => {
    setIsDeletingIndex(index);
    try {
      await axios.delete(
        "https://service-provider-website.onrender.com/api/v1/providers/deleteServicePairs",
        { data: { index }, withCredentials: true }
      );
      const updatedServices = services.filter((_, i) => i !== index);
      const updatedPricing = pricing.filter((_, i) => i !== index);
      setServices(updatedServices);
      setPricing(updatedPricing);
      toast.success("Delete successful");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Error occurred while deleting");
    } finally {
      setIsDeletingIndex(null);
    }
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditService(services[index]);
    setEditPrice(pricing[index]);
  };

  const handleSaveEdit = async () => {
    setIsEditingIndex(editIndex);
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
      toast.success("Edit successful");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Error occurred while editing");
    } finally {
      setIsEditingIndex(null);
    }
  };

  const handleAddPair = async (e) => {
    e.preventDefault(); // Use form submission for better accessibility
    if (!newService.trim() || !newPrice.trim()) {
      toast.error("Both service and price are required.");
      return;
    }
    setIsAdding(true);
    try {
      await axios.put(
        "https://service-provider-website.onrender.com/api/v1/providers/updateProvider",
        {
          servicesOffered: newService,
          pricing: newPrice,
        },
        { withCredentials: true }
      );

      setServices([...services, newService]);
      setPricing([...pricing, newPrice]);
      setNewService("");
      setNewPrice("");
      toast.success("Service added!");
    } catch (err) {
      console.error("Add failed", err);
      toast.error("Error occurred while adding service");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-12">
      <div className="max-w-4xl w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8 tracking-wide">
          Manage Services
        </h2>

        {/* Service list container */}
        <div className="space-y-4">
          {services.length > 0 ? (
            services.map((service, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 rounded-lg border border-gray-200 transition-all duration-300 ${
                  editIndex === index ? "bg-indigo-50" : "bg-gray-50 hover:shadow-md"
                }`}
              >
                {/* Service Name & Price Column */}
                <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editService}
                        onChange={(e) => setEditService(e.target.value)}
                        className="w-full border-indigo-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="Service Name"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-800 break-words">
                        {service}
                      </h3>
                    )}
                  </div>
                  <div>
                    {editIndex === index ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full border-indigo-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="Price (₹)"
                      />
                    ) : (
                      <p className="text-gray-700 font-medium text-lg">
                        ₹{pricing[index]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons Column -- ✨ FIX APPLIED HERE ✨ */}
                <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2 mt-4 md:mt-0">
                  {editIndex === index ? (
                    <button
                      onClick={handleSaveEdit}
                      disabled={isEditingIndex === index}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm disabled:bg-green-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      <FaSave />
                      {isEditingIndex === index ? "Saving..." : "Save"}
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(index)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm transform hover:-translate-y-0.5"
                    >
                      <FaEdit /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePair(index)}
                    disabled={isDeletingIndex === index}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm disabled:bg-red-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    <FaTrash />
                    {isDeletingIndex === index ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
              <h3 className="text-xl font-semibold text-gray-600">No Services Yet</h3>
              <p className="text-gray-500 mt-2">Add your first service using the form below.</p>
            </div>
          )}
        </div>

        {/* Add New Service Form */}
        <div className="mt-10 border-t-2 border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Add New Service
          </h3>
          <form
            onSubmit={handleAddPair}
            className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center"
          >
            <input
              type="text"
              placeholder="New service name"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="sm:col-span-3 border text-gray-600 border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="sm:col-span-2 border text-gray-600 border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isAdding}
              className="sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <FaPlus />
              {isAdding ? "..." : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserServices;