import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const body = { email, password };

    try {
      toast
        .promise(
          axios.post("http://localhost:5000/api/v1/customers/loginCustomer", body, {
            withCredentials: true,
          }),
          {
            loading: "Logging into your account...",
            success: "Logged in successfully!",
            error: (err) =>
              err?.response?.data?.message || "Login failed. Try again.",
          }
        )
        .then((res) => {
          if (res.data.success) {
            navigate("/home");
          }
        });
    } catch (error) {
      alert("Login error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left welcome panel */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col justify-center items-center px-10 py-20">
        <h1 className="text-4xl font-bold mb-4 text-center">Welcome Back</h1>
        <h2 className="text-xl font-semibold mb-2 text-center">
          Access your Service Finder dashboard
        </h2>
        <p className="text-sm text-center max-w-md">
          Log in to connect with local professionals or manage your service listings.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Log In to Your Account
          </h2>

          <div className="text-sm text-center text-gray-600 mb-4">
            Don’t have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={handleSignUpRedirect}
            >
              Create one
            </button>
          </div>

          {/* Email */}
          <label className="block text-sm text-gray-700">Email</label>
          <input
            type="email"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label className="block text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Login Button */}
          <button
            className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={handleLogin}
          >
            Log In
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By logging in, you agree to our{" "}
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

export default Login;
