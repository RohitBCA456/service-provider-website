"use client"
import axios from "axios"
import { useState, useEffect } from "react"

export default function UpdateProfile() {
  // Data for form submission (only editable fields)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    avatar: null,
  })

  // Data for display only (read-only fields)
  const [displayData, setDisplayData] = useState({
    email: "",
    role: "",
    servicesOffered: "",
    pricing: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [toast, setToast] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("https://service-provider-website.onrender.com/api/v1/auth/getCurrentUser", {
          withCredentials: true,
        })
        const data = response.data
        const user = data.user || data

        // Set form data (only editable fields)
        setFormData({
          name: user.name || "",
          address: user.location?.address || "",
          coordinates: {
            latitude: user.location?.coordinates?.[1] || "",
            longitude: user.location?.coordinates?.[0] || "",
          },
          avatar: null,
        })

        // Set display data (read-only fields)
        setDisplayData({
          email: user.email || "",
          role: user.role || "",
          servicesOffered: user.servicesOffered?.join(", ") || "",
          pricing: user.Pricing?.join(", ") || "",
        })

        if (user.avatar) {
          setAvatarPreview(user.avatar)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        showToast("Failed to load user data", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCoordinateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: value,
      },
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }))
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLocationUpdate = async () => {
    setIsUpdatingLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setFormData((prev) => ({
              ...prev,
              coordinates: {
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
              },
            }))
            showToast("Location updated successfully!")
            setIsUpdatingLocation(false)
          },
          (error) => {
            console.error("Geolocation error:", error)
            // Fallback to mock coordinates
            const mockCoordinates = {
              latitude: (Math.random() * 180 - 90).toFixed(6),
              longitude: (Math.random() * 360 - 180).toFixed(6),
            }
            setFormData((prev) => ({
              ...prev,
              coordinates: mockCoordinates,
            }))
            showToast("Location updated with mock data!")
            setIsUpdatingLocation(false)
          },
        )
      } else {
        throw new Error("Geolocation not supported")
      }
    } catch (error) {
      showToast("Failed to update location. Please try again.", "error")
      setIsUpdatingLocation(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.address) {
      showToast("Please fill in all required fields.", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()

      // Only send editable fields
      formDataToSend.append("name", formData.name)
      formDataToSend.append("address", formData.address)
      formDataToSend.append("latitude", formData.coordinates.latitude)
      formDataToSend.append("longitude", formData.coordinates.longitude)

      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar)
      }

      const endpoint =
        displayData.role === "provider"
          ? "https://service-provider-website.onrender.com/api/v1/providers/updateProvider"
          : "https://service-provider-website.onrender.com/api/v1/customers/updateCustomer"

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const data = await response.json()
      console.log("Profile updated:", data)
      showToast("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast(error.message || "Failed to update profile. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Update Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <label
                    htmlFor="avatar"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Change Photo
                  </label>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={displayData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Email address"
                readOnly
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Role Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        displayData.role === "provider"
                          ? "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                          : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      }
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-blue-700 capitalize">{displayData.role}</div>
                    <div className="text-sm text-blue-600">
                      {displayData.role === "provider" ? "Offering services" : "Looking for services"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider-specific fields (Read-only) */}
            {displayData.role === "provider" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Services Offered</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 min-h-[40px] flex items-center">
                    {displayData.servicesOffered || "No services specified"}
                  </div>
                  <p className="text-xs text-gray-500">Services cannot be edited from this page</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pricing</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 min-h-[40px] flex items-center">
                    {displayData.pricing || "No pricing specified"}
                  </div>
                  <p className="text-xs text-gray-500">Pricing cannot be edited from this page</p>
                </div>
              </>
            )}

            {/* Address Field */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 text-gray-600 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Enter your full address"
                required
              />
            </div>

            {/* Location Coordinates */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.latitude}
                      onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
                      className="w-full px-2 text-gray-600 py-1 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.longitude}
                      onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
                      className="w-full text-gray-600 px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.000000"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLocationUpdate}
                  disabled={isUpdatingLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdatingLocation ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                      Updating Location...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Get Current Location
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            className={`p-4 rounded-md shadow-lg ${
              toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "error" ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
