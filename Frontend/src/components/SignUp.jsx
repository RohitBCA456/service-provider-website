import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function CreateAccount() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => console.error("Location error:", err)
    );
  }, []);

  const handleCreateAccount = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !coords.latitude ||
      !coords.longitude
    ) {
      alert("All fields are required.");
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      alert("Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("address", address);
    formData.append("latitude", coords.latitude);
    formData.append("longitude", coords.longitude);
    if (avatar) formData.append("avatar", avatar);

    toast.promise(
      axios.post("http://localhost:5000/api/v1/customers/registerCustomer", formData, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: "Registering your account...",
        success: "Account created successfully!",
        error: (err) =>
          err?.response?.data?.message || "Registration failed. Try again.",
      }
    ).then((res) => {
      if (res.data.success) {
        navigate("/Login");
      }
    });
  };

  const handleSignInRedirect = () => navigate("/login");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left welcome panel */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col justify-center items-center px-10 py-20">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Join Service Finder
        </h1>
        <h2 className="text-xl font-semibold mb-2 text-center">
          Connecting People to Services Near You
        </h2>
        <p className="text-sm text-center max-w-md">
          Sign up to explore trusted local professionals or grow your own
          service business with ease.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create Your Free Account
          </h2>

          {/* Sign in link */}
          <div className="text-sm text-center text-gray-600 mb-4">
            Already a member?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={handleSignInRedirect}
            >
              Sign In
            </button>
          </div>

          {/* Name */}
          <label className="block text-sm text-gray-700">Full Name</label>
          <input
            type="text"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <label className="block text-sm text-gray-700">Email</label>
          <input
            type="email"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <label className="block text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role */}
          <label className="block text-sm text-gray-700">Role</label>
          <select
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">customer</option>
            <option value="provider">provider</option>
          </select>

          {/* Address */}
          <label className="block text-sm text-gray-700">Your Address</label>
          <input
            type="text"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="Street, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Avatar Upload */}
          <label className="block text-sm text-gray-700 mb-1">
            Profile Photo (optional)
          </label>
          <div
            className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type.startsWith("image/")) {
                setAvatar(droppedFile);
              }
            }}
          >
            {avatar ? (
              <div className="flex flex-col items-center">
                <img
                  src={URL.createObjectURL(avatar)}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <p className="text-sm text-gray-600">Click to change</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Drag & drop your avatar here, or click to browse
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setAvatar(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By signing up, you agree to our{" "}
            <a
              href="/terms-of-service"
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
