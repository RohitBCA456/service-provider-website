import React from "react";

// Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const ServiceCard = ({
  name,
  image,
  description,
  reviews = 0,
  servicesOffered = [],
  providerCoords,
  userCoords,
}) => {
  const distance = userCoords && providerCoords
    ? calculateDistance(
        userCoords[1],
        userCoords[0],
        providerCoords[1],
        providerCoords[0]
      )
    : "N/A";

  return (
    <section className="mx-auto antialiased">
      <article className="flex flex-wrap md:flex-nowrap shadow-lg mx-auto max-w-3xl group cursor-pointer transform duration-500 hover:-translate-y-1">
        <img
          className="w-full max-h-[400px] object-cover md:w-52"
          src={image}
          alt={name}
        />
        <div className="flex-1">
          <div className="p-5 pb-10">
            <h1 className="text-2xl font-semibold mt-4">{name}</h1>
            <p className="text-xl text-gray-400 mt-2 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="bg-blue-50 p-5">
            <div className="sm:flex sm:justify-between">
              <div>
                <div className="text-lg text-gray-700">
                  <span className="text-gray-900 font-bold">{distance} km</span> from your location
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 mx-px fill-current ${
                          index < reviews ? "text-green-600" : "text-gray-300"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 14 14"
                      >
                        <path d="M6.43 12l-2.36 1.64a1 1 0 0 1-1.53-1.11l.83-2.75a1 1 0 0 0-.35-1.09L.73 6.96a1 1 0 0 1 .59-1.8l2.87-.06a1 1 0 0 0 .92-.67l.95-2.71a1 1 0 0 1 1.88 0l.95 2.71c.13.4.5.66.92.67l2.87.06a1 1 0 0 1 .59 1.8l-2.3 1.73a1 1 0 0 0-.34 1.09l.83 2.75a1 1 0 0 1-1.53 1.1L7.57 12a1 1 0 0 0-1.14 0z"></path>
                      </svg>
                    ))}
                  </div>
                  <div className="text-gray-600 ml-2 text-sm md:text-base mt-1">
                    {reviews > 0 ? `${reviews} reviews` : "No reviews yet"}
                  </div>
                </div>
              </div>
              <button className="mt-3 sm:mt-0 py-2 px-5 md:py-3 md:px-6 bg-purple-700 hover:bg-purple-600 font-bold text-white md:text-lg rounded-lg shadow-md">
                Contact Now
              </button>
            </div>
            <div className="mt-3 text-gray-600 text-sm md:text-sm">
              *Services: {servicesOffered.length > 0 ? servicesOffered.join(", ") : "None"}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ServiceCard;
