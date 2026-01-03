import React from "react";
import { useNavigate } from "react-router-dom";

const ServiceCard = ({
  providerId,
  name,
  image,
  description,
  rating = 0,
  reviews = 0,
  servicesOffered = [],
  distance,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/Profile", { state: { providerId } });
  };

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
                  <span className="text-gray-900 font-bold">
                    {distance} km
                  </span>{" "}
                  from your location
                </div>

                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 mx-px fill-current ${
                          i < rating
                            ? "text-green-600"
                            : "text-gray-300"
                        }`}
                        viewBox="0 0 14 14"
                      >
                        <path d="M6.43 12l-2.36 1.64a1 1 0 0 1-1.53-1.11l.83-2.75a1 1 0 0 0-.35-1.09L.73 6.96a1 1 0 0 1 .59-1.8l2.87-.06a1 1 0 0 0 .92-.67l.95-2.71a1 1 0 0 1 1.88 0l.95 2.71c.13.4.5.66.92.67l2.87.06a1 1 0 0 1 .59 1.8l-2.3 1.73a1 1 0 0 0-.34 1.09l.83 2.75a1 1 0 0 1-1.53 1.1L7.57 12a1 1 0 0 0-1.14 0z" />
                      </svg>
                    ))}
                  </div>

                  <div className="text-gray-600 ml-2 text-sm mt-1">
                    {reviews > 0 ? `${reviews} reviews` : "No reviews yet"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNavigate}
                className="mt-3 sm:mt-0 py-2 px-5 bg-purple-700 hover:bg-purple-600 font-bold text-white rounded-lg shadow-md"
              >
                Contact Now
              </button>
            </div>

            <div className="mt-3 text-gray-600 text-sm">
              *Services:{" "}
              {servicesOffered.length
                ? servicesOffered.join(", ")
                : "None"}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ServiceCard;
