import React, { useEffect, useState } from "react";
import axios from "axios";

const UserServices = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `https://service-provider-website.onrender.com/api/v1/auth/getUserDetails/${userId}`
        );
        setUser(res.data.user);
        setServices(res.data.user.servicesOffered || []);
        setPricing(res.data.user.pricing || []);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleDeleteService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeletePricing = (index) => {
    setPricing((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://service-provider-website.onrender.com/api/v1/auth/updateProvider`,
        {
          servicesOffered: services,
          pricing: pricing,
        }
      );
      alert("Updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        {user?.name}'s Services
      </h2>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Services Offered</h3>
        <ul className="space-y-2">
          {services.map((service, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-blue-50 hover:bg-blue-100 p-3 rounded-md transition-all"
            >
              <span>{service}</span>
              <button
                onClick={() => handleDeleteService(i)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Pricing</h3>
        <ul className="space-y-2">
          {pricing.map((price, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-green-50 hover:bg-green-100 p-3 rounded-md transition-all"
            >
              <span>₹{price}</span>
              <button
                onClick={() => handleDeletePricing(i)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-md"
        >
          Save Changes 💾
        </button>
      </div>
    </div>
  );
};

export default UserServices;
