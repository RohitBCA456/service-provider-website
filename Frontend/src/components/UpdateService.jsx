import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "./Loader";

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
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingIndex, setIsDeletingIndex] = useState(null);
  const [isEditingIndex, setIsEditingIndex] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/auth/getCurrentUser",
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
    setIsDeletingIndex(index);
    try {
      await axios.delete(
        "http://localhost:5000/api/v1/providers/deleteServicePairs",
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
        "http://localhost:5000/api/v1/providers/updateServicePairs",
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

  const handleAddPair = async () => {
    if (!newService.trim() || !newPrice.trim()) {
      toast.error("Both service and price are required.");
      return;
    }
    setIsAdding(true);
    try {
      await axios.put(
        "http://localhost:5000/api/v1/providers/updateProvider",
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
      toast.success("Service added!");
    } catch (err) {
      console.error("Add failed", err);
      toast.error("Error occurred while adding service");
    } finally {
      setIsAdding(false);
    }
  };

  if (!user)
    return (
      <Loader />
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br light:from-blue-100 to-purple-200 px-4 py-12">
      <div className="max-w-4xl w-full bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10 tracking-wide">
          {user.name}'s Service Pricing
        </h2>

        {/* Service list */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 hover:shadow-md border border-gray-200 rounded-xl p-4 gap-4 transition-all"
            >
              {/* Service */}
              <div className="w-full sm:w-1/3 text-center sm:text-left">
                {editIndex === index ? (
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="border border-indigo-300 rounded-md px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service}
                  </h3>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 w-full sm:w-1/3 justify-center">
                {editIndex === index ? (
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="border border-indigo-300 rounded-md px-4 py-2 w-28 text-center text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                ) : (
                  <p className="text-gray-700 font-medium text-lg">
                    ₹{pricing[index]}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full sm:w-1/3 justify-center sm:justify-end">
                {editIndex === index ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={isEditingIndex === index}
                    className={`${
                      isEditingIndex === index
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm`}
                  >
                    <FaSave />
                    {isEditingIndex === index ? "Editing..." : "Save"}
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(index)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeletePair(index)}
                  disabled={isDeletingIndex === index}
                  className={`${
                    isDeletingIndex === index
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm`}
                >
                  <FaTrash />
                  {isDeletingIndex === index ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Service */}
        <div className="mt-10 border-t border-gray-600 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Add New Service
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <input
              type="text"
              placeholder="New service"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="border text-gray-600 border-indigo-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="border text-gray-600 border-green-300 rounded-lg px-4 py-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAddPair}
              disabled={isAdding}
              className={`${
                isAdding
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white px-6 py-2 rounded-lg transition-all shadow-md flex items-center gap-2`}
            >
              <FaPlus />
              {isAdding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserServices;
