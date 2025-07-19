import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    console.log(formData)

    if (!formData.servicesOffered || !formData.price) {
      setToast({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 light:to-purple-200 px-4 py-12">
      <div className="relative w-full max-w-2xl p-8 rounded-xl shadow-xl backdrop-blur-md bg-white/80 border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-800">
          Add New Service
        </h2>

        {toast && (
          <div
            className={`mb-4 p-3 rounded text-sm text-center font-medium ${
              toast.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Plumbing Repair"
              value={formData.servicesOffered}
              onChange={(e) =>
                handleInputChange("servicesOffered", e.target.value)
              }
              className="w-full px-4 py-2 border text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Fixed) *
            </label>
            <input
              type="number"
              placeholder="e.g., 499"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full px-4 py-2 border text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "Add Service"}
          </button>
        </form>
      </div>
    </div>
  );
}
