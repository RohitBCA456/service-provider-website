import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "./Loader"; // Assuming Loader component exists

// A simple spinner component for buttons
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const UserServices = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editService, setEditService] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");

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
      toast.success("Service deleted successfully.");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Error occurred while deleting.");
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
        { index: editIndex, service: editService, price: editPrice },
        { withCredentials: true }
      );
      const updatedServices = [...services];
      const updatedPricing = [...pricing];
      updatedServices[editIndex] = editService;
      updatedPricing[editIndex] = editPrice;
      setServices(updatedServices);
      setPricing(updatedPricing);
      setEditIndex(null);
      toast.success("Service updated successfully.");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Error occurred while editing.");
    } finally {
      setIsEditingIndex(null);
    }
  };

  const handleAddPair = async (e) => {
    e.preventDefault();
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
      toast.success("New service added!");
    } catch (err) {
      console.error("Add failed", err);
      toast.error("Error occurred while adding service.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-2">
            Manage Your Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add, edit, or remove the services you offer.
          </p>
        </div>

        {/* Service list */}
        <div className="space-y-4">
          {services.length > 0 ? (
            services.map((service, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-4 rounded-lg transition-colors duration-300 ${
                  editIndex === index
                    ? "bg-blue-50 dark:bg-gray-700/50"
                    : "bg-white dark:bg-gray-800"
                } border border-gray-200 dark:border-gray-700`}
              >
                {/* Service and Price */}
                {editIndex === index ? (
                  <>
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        value={editService}
                        onChange={(e) => setEditService(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-6 text-gray-800 dark:text-gray-200 font-semibold text-lg">
                      {service}
                    </div>
                    <div className="md:col-span-3 text-gray-600 dark:text-gray-400 font-medium text-lg">
                      ₹{pricing[index]}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="md:col-span-3 flex gap-2 justify-start md:justify-end">
                  {editIndex === index ? (
                    <button
                      onClick={handleSaveEdit}
                      disabled={isEditingIndex === index}
                      className="flex items-center justify-center w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md disabled:opacity-50"
                    >
                      {isEditingIndex === index ? (
                        <Spinner />
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(index)}
                      className="flex items-center justify-center w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePair(index)}
                    disabled={isDeletingIndex === index}
                    className="flex items-center justify-center w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md disabled:opacity-50"
                  >
                    {isDeletingIndex === index ? (
                      <Spinner />
                    ) : (
                      <FaTrash className="mr-2" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                No services found.
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Get started by adding your first service below!
              </p>
            </div>
          )}
        </div>

        {/* Add New Service Form */}
        <div className="mt-10 border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
            Add a New Service
          </h3>
          <form
            onSubmit={handleAddPair}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
          >
            <input
              type="text"
              placeholder="Service name (e.g., Plumbing Repair)"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="sm:col-span-6 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500 rounded-md px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="sm:col-span-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500 rounded-md px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={isAdding}
              className="sm:col-span-3 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {isAdding ? <Spinner /> : <FaPlus className="mr-2" />}
              {isAdding ? "Adding..." : "Add Service"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserServices;