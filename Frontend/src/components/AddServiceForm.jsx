import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTag, FiDollarSign, FiPlus, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Loader from "./Loader"; // 🔹 Import your Loader component

export default function AddServiceForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    servicesOffered: "",
    price: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.servicesOffered || !formData.price) {
      setToast({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch(
        "https://service-provider-website.onrender.com/api/v1/providers/updateProvider",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            servicesOffered: formData.servicesOffered.trim(),
            pricing: parseFloat(formData.price),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Server Error");
      }

      setToast({ type: "success", message: "Service added successfully!" });
      setFormData({ servicesOffered: "", price: "" });
    } catch (error) {
      console.error("Error adding service:", error);
      setToast({
        type: "error",
        message: error.message || "Failed to add service",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Show loader while submitting
  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 light:to-purple-200 px-4 py-12">
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-xl backdrop-blur-md bg-white/80 border border-gray-200 transition-shadow duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Add New Service
        </h2>

        {toast && (
          <div
            className={`flex items-center justify-center gap-x-2 mb-4 p-3 rounded-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <FiCheckCircle className="h-5 w-5" />
            ) : (
              <FiAlertCircle className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiTag className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="e.g., Plumbing Repair"
                value={formData.servicesOffered}
                onChange={(e) =>
                  handleInputChange("servicesOffered", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2.5 border text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (Fixed) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiDollarSign className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="number"
                placeholder="e.g., 499"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            <span>Add Service</span>
          </button>
        </form>
      </div>
    </div>
  );
}
