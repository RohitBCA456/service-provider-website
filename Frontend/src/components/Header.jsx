import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  GlobeIcon,
  HamburgerMenuIcon,
  PersonIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ServiceFinderHeader = ({ theme, setTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchService, setSearchService] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    toast.promise(
      axios.get("http://localhost:5000/api/v1/providers/logoutProvider", {
        withCredentials: true,
      }),
      {
        loading: "Logging out...",
        success: "Logout successful!",
        error: "Logout failed. Please try again.",
      }
    ).then(() => {
      navigate("/login");
    });
  };

const handleSearch = () => {
  if (!searchService.trim()) {
    toast.error("Please enter a service to search.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      toast.promise(
        (async () => {
          const res = await axios.get("http://localhost:5000/api/v1/providers/getAllNearByProviders", {
            params: {
              lat,
              lng,
              service: searchService.trim(),
            },
          });

          const providers = res.data;

          console.log("Lat:", lat, "Lng:", lng, "Service:", searchService);
          console.log("Found providers:", providers);

          if (providers.length === 0) {
            throw new Error("No providers found near you.");
          }

          setSearchService("");

          navigate("/Providers", {
            state: { providers },
          });

          return "Providers fetched successfully!";
        })(),
        {
          loading: "Searching nearby providers...",
          success: (msg) => msg,
          error: (err) =>
            err?.message || "Failed to fetch providers. Try again.",
        }
      );
    },
    (error) => {
      console.error("Geolocation error:", error);
      toast.error("Location access denied or unavailable.");
    }
  );
};

  return (
    <nav className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="https://cdn-icons-png.flaticon.com/512/10444/10444900.png"
            alt="Logo"
            className="h-8 md:h-10 cursor-pointer hover:scale-105 transition-transform duration-200"
          />
          <span className="text-lg md:text-xl font-bold tracking-tight">
            ServiceFinder
          </span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full px-4 py-2 max-w-md w-full mx-4">
          <input
            type="text"
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
            placeholder="Search for services..."
            className="flex-1 bg-transparent text-sm md:text-base text-zinc-700 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none px-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="relative flex items-center gap-2 md:gap-4" ref={dropdownRef}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hover:scale-110 transition-transform duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="w-5 h-5 text-yellow-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-zinc-700" />
            )}
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm md:text-base cursor-pointer hover:text-blue-600 transition-colors">
              For Providers
            </span>
            <GlobeIcon className="w-5 h-5 cursor-pointer hover:scale-110" />
          </div>

          {/* Dropdown Trigger */}
          <div
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <HamburgerMenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <PersonIcon className="w-6 h-6 text-gray-600 dark:text-gray-300 rounded-full" />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 w-44 bg-white dark:bg-zinc-800 shadow-lg border border-gray-100 dark:border-zinc-700 rounded-md overflow-hidden z-50">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700">
                Update Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full px-4 py-2 w-full">
          <input
            type="text"
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
            placeholder="Search services..."
            className="flex-1 bg-transparent text-sm text-zinc-700 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none px-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ServiceFinderHeader;
