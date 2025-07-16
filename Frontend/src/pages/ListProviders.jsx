import React from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "../components/ListProvidersPage";

function ListProviders() {
  const location = useLocation();
  const providers = location.state?.providers || [];

  return (
    <div className="px-4 py-6 space-y-6">
      {providers && providers.length > 0 ? (
        providers.map((provider) => (
          <ServiceCard
            key={provider._id}
            providerId={provider._id}
            name={provider.name}
            image={
              provider.avatar ||
              "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg"
            }
            description={provider.location?.address || "No address provided"}
            reviews={provider.rating || 0}
            servicesOffered={provider.servicesOffered}
            providerCoords={provider.location?.coordinates}
            userCoords={[91.7635072, 26.1586944]} // example: replace with user's real location
          />
        ))
      ) : (
        <p className="text-center text-gray-600">No providers found.</p>
      )}
    </div>
  );
}

export default ListProviders;
