import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "../components/ListProvidersPage";

// distance helper
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function ListProviders() {
  const location = useLocation();
  const providers = location.state?.providers || [];

  const [userCoords, setUserCoords] = useState(null);

  // 📍 Get user's real location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      },
      (err) => {
        console.error("Location error:", err);
        // fallback (optional)
        setUserCoords([91.7635072, 26.1586944]);
      }
    );
  }, []);

  if (!userCoords) {
    return <p className="text-center">Fetching your location...</p>;
  }

  const [userLng, userLat] = userCoords;

  const nearbyProviders = providers
    .map((provider) => {
      if (!provider.location?.coordinates) return null;

      const [provLng, provLat] = provider.location.coordinates;

      const distance = calculateDistance(
        userLat,
        userLng,
        provLat,
        provLng
      );

      return {
        ...provider,
        distance: Number(distance.toFixed(2)),
      };
    })
    .filter(
      (provider) => provider && provider.distance <= 20 
    );

  return (
    <div className="px-4 py-6 space-y-6">
      {nearbyProviders.length > 0 ? (
        nearbyProviders.map((provider) => (
          <ServiceCard
            key={provider._id}
            providerId={provider._id}
            name={provider.name}
            image={
              provider.avatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm1XBi0Axlc_t4jSZYj7E_rNhZtGMVTKFfFA&s"
            }
            description={provider.location?.address}
            rating={provider.rating || 0}
            reviews={provider.review || 0}
            servicesOffered={provider.servicesOffered}
            distance={provider.distance} 
          />
        ))
      ) : (
        <p className="text-center text-gray-500">
          No providers found within 20 km.
        </p>
      )}
    </div>
  );
}

export default ListProviders;
