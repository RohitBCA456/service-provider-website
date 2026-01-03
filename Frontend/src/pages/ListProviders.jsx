import React from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "../components/ListProvidersPage";

function ListProviders() {
  const location = useLocation();
  const providers = location.state?.providers || [];

  console.log(providers);

  return (
    <div className="px-4 py-6 space-y-6">
      {providers.length > 0 ? (
        providers
          .filter((provider) => {
            if (!provider.location?.coordinates) return false;

            const [lng, lat] = provider.location.coordinates;
            const [userLng, userLat] = [91.7635072, 26.1586944];

            const toRad = (v) => (v * Math.PI) / 180;
            const R = 6371;

            const dLat = toRad(lat - userLat);
            const dLng = toRad(lng - userLng);

            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(userLat)) *
                Math.cos(toRad(lat)) *
                Math.sin(dLng / 2) ** 2;

            const distance =
              R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

            return distance <= 20;
          })
          .map((provider) => (
            <ServiceCard
              key={provider._id}
              providerId={provider._id}
              name={provider.name}
              image={provider.avatar}
              description={provider.location?.address}
              rating={provider.rating || 0}
              reviews={provider.review || 0}
              servicesOffered={provider.servicesOffered}
              providerCoords={provider.location.coordinates}
              userCoords={[91.7635072, 26.1586944]}
            />
          ))
      ) : (
        <p>No providers found.</p>
      )}
    </div>
  );
}

export default ListProviders;
