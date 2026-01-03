import { useEffect, useRef, useState } from "react";
import { Star, MapPin } from "lucide-react";
import axios from "axios";

// Marquee component (unchanged)
const Marquee = ({
  children,
  direction = "left",
  speed = 50,
  pauseOnHover = true,
  className = "",
}) => {
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  return (
    <div
      className={`overflow-hidden relative ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className={`flex min-w-full gap-4 animate-scroll`}
        style={{
          animation: `scroll-${direction} ${
            contentWidth / speed
          }s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        <div ref={contentRef} className="flex gap-4 shrink-0">
          {children}
        </div>
        <div className="flex gap-4 shrink-0">{children}</div>
      </div>

      <style>
        {`
          @keyframes scroll-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

// ProviderCard (unchanged)
const ProviderCard = ({ avatar, name, rating, services, location }) => (
  <div className="w-80 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer">
    <div className="flex items-center gap-4 mb-3">
      <img
        src={
          avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
        }
        alt={name}
        className="w-12 h-12 rounded-full object-cover border"
      />
      <div>
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
          {name}
        </h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mb-2">
      <MapPin className="w-4 h-4" />
      <span>{location}</span>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300">
      <p className="font-medium mb-1">Services Offered:</p>
      <ul className="list-disc ml-4">
        {services.map((service, idx) => (
          <li key={idx}>{service}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default function MarqueeProviderDemo() {
  const [providers, setProviders] = useState([]);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const service = ""; // or you can dynamically set this based on user input

  // Fetch real-time coordinates on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError("Location permission denied or unavailable.");
        console.error("Geolocation error:", err);
      }
    );
  }, []);

  // Fetch providers once coordinates are available
  useEffect(() => {
    const fetchProviders = async () => {
      if (!coords) return;

      try {
        const url = `https://service-provider-website.onrender.com/api/v1/providers/getAllNearByProviders?lat=${coords.lat}&lng=${coords.lng}&service=${service}`;
        const res = await axios.get(url, {
          withCredentials: true,
        });
        const data = res.data;
        setProviders(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError("Failed to load providers.");
      }
    };

    fetchProviders();
  }, [coords]);

  return (
    <div className="py-16 bg-gray-50 dark:bg-zinc-950">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
        Trusted Local Service Providers
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {!coords ? (
        <p className="text-center text-gray-500 dark:text-gray-300">
          Fetching your location...
        </p>
      ) : providers.length > 0 ? (
        <Marquee direction="left" className="py-4 px-6" speed={40}>
          {providers.map((provider) => (
            <ProviderCard
              key={provider._id}
              avatar={provider.avatar}
              name={provider.name}
              rating={Math.round(provider.rating || 0)}
              services={provider.servicesOffered || []}
              location={provider.location?.address || "Location unavailable"}
            />
          ))}
        </Marquee>
      ) : (
        <p className="text-gray-500 dark:text-gray-300 text-center w-full mt-4">
          No nearby providers found.
        </p>
      )}
    </div>
  );
}
