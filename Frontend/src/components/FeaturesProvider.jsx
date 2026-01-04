import axios from "axios";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sliders,
  Bell,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    unreadRoomsCount: 0,
  });

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        const res = await axios.get(
          "https://service-provider-website.onrender.com/api/v1/booking/getBookingStats",
          {
            withCredentials: true,
          }
        );
        console.log(res.data);
        setBookingStats(res.data); // assuming res.data is {pending, accepted, rejected, ...}
      } catch (error) {
        console.error("Error fetching booking stats:", error);
      }
    };

    fetchBookingStats();
  }, []);

  const features = [
    {
      icon: ClipboardList,
      title: "View All Bookings",
      status: 'pending',
      description:
        "Easily manage and track all service requests from nearby customers.",
      iconColor: "#0F0091",
      total: bookingStats.pending,
    },
    {
      icon: CheckCircle2,
      title: "Accepted Appointments",
      status: "accepted",
      description:
        "Quickly access all your confirmed appointments in one place.",
      iconColor: "#09C272",
      total: bookingStats.accepted,
    },
    {
      icon: XCircle,
      title: "Rejected Appointments",
      status: "rejected",
      description: "Review and analyze the appointments you've declined.",
      iconColor: "#E85F00",
      total: bookingStats.rejected,
    },
    {
      icon: PlusCircle,
      title: "Add Services",
      description: "Grow your business by listing more services you offer.",
      iconColor: "#7E0AC4",
      route: "/AddService" 
    },
    {
      icon: Sliders,
      title: "Manage Services",
      description:
        "Update, remove or adjust the pricing of your services anytime.",
      iconColor: "#1267D4",
      route: "/ManageService"
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description:
        "Get real-time alerts for bookings, confirmations and messages.",
      iconColor: "#BF1495",
      route: "/ChatMenu",
      total: bookingStats.unreadRoomsCount
    },
  ];

  const handleNavigate = (feature) => {
    if (feature.status) {
      navigate("/Features", { state: { status: feature.status } });
    }
    else if(feature.route) {
      navigate(feature.route)
    }
  };

  const useUnreadRooms = () => {

  const fetchUnreadRoomsCount = async () => {
    try {
      const res = await axios.get(
        "https://service-provider-website.onrender.com/api/v1/auth/getUnreadRoomsCount",
        { withCredentials: true }
      );
      setUnreadCount(res.data.unreadRoomsCount);
    } catch (err) {
      console.error("Failed to fetch unread room count", err);
    }
  };

  useEffect(() => {
    fetchUnreadRoomsCount();

    socket.on("new-message", () => {
      fetchUnreadRoomsCount(); 
    });

    return () => {
      socket.off("new-message");
    };
  }, []);

  return unreadCount;
};

  return (
    <div className="flex flex-col items-center h-full max-w-[1440px] pt-[88px] p-5">
      <div className="text-[48px] sm:text-[58px] font-bold text-center">
        Provider Features
      </div>
      <div className="flex h-fit flex-wrap justify-center max-w-[1248px] mt-10 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={() => handleNavigate(feature)}
            className="rounded-2xl bg-[#F1F1F1] p-6 w-[358px] h-[282px] overflow-hidden shadow-sm
             hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] 
            transition-transform duration-300 ease-in-out transform cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center">
                <feature.icon
                  className="w-8 h-8"
                  style={{ color: feature.iconColor }}
                />
              </div>
              {feature.total !== undefined && (
                <div className="font-black text-[42px] text-[#E9E9E9]">
                  {feature.total}
                </div>
              )}
            </div>
            <div className="text-[22px] font-semibold text-[#121212] mt-5">
              {feature.title}
            </div>
            <div className="text-[#777777] mt-3 text-[14px]">
              {feature.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
