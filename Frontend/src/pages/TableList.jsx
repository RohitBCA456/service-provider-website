import React from "react";

const TableList = ({ selectedTitle = "View All Bookings" }) => {
  const defaultAvatar =
    "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg";

  const allBookings = [
    {
      name: "John Doe",
      job: "Chef",
      img: "",
      email: "johndoe@example.com",
      status: "Pending",
    },
    {
      name: "Victoria Bright",
      job: "Designer",
      img: "https://randomuser.me/api/portraits/women/45.jpg",
      email: "victoria@example.com",
      status: "Completed",
    },
    {
      name: "David King",
      job: "Electrician",
      img: "https://randomuser.me/api/portraits/men/12.jpg",
      email: "david@example.com",
      status: "Rejected",
    },
  ];

  const services = [
    { title: "AC Repair", provider: "Ravi Kumar", price: "₹800" },
    { title: "Carpentry", provider: "Arjun Singh", price: "₹1200" },
  ];

  const notifications = [
    { message: "You have a new service request.", time: "5 mins ago" },
    { message: "Booking confirmed for Sunday.", time: "15 mins ago" },
  ];

  const getFilteredData = () => {
    switch (selectedTitle) {
      case "View All Bookings":
        return allBookings;
      case "Accepted Appointments":
        return allBookings.filter((b) => b.status === "Completed");
      case "Rejected Appointments":
        return allBookings.filter((b) => b.status === "Rejected");
      default:
        return [];
    }
  };

  const renderButtons = (status) => {
    if (selectedTitle === "View All Bookings") {
      return (
        <div className="flex gap-2">
          <button className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600">
            Accept
          </button>
          <button className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600">
            Reject
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full p-7">
      <h3 className="text-xl font-bold mb-4">{selectedTitle}</h3>

      {selectedTitle === "Manage Services" ? (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/30">
              <th className="p-3">Service</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Price</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, idx) => (
              <tr key={idx} className="border-b border-white/10">
                <td className="p-3">{service.title}</td>
                <td className="p-3">{service.provider}</td>
                <td className="p-3">{service.price}</td>
                <td className="p-3">
                  <button className="bg-white text-sky-950 px-3 py-1 rounded hover:bg-gray-300">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : selectedTitle === "Instant Notifications" ? (
        <ul className="space-y-3">
          {notifications.map((note, index) => (
            <li
              key={index}
              className="p-4 border border-white/20 rounded-lg bg-white/10"
            >
              <p className="font-medium">{note.message}</p>
              <span className="text-sm text-gray-300">{note.time}</span>
            </li>
          ))}
        </ul>
      ) : selectedTitle === "Add Services" ? (
        <div className="text-white">
          <p>This is a placeholder for the Add Services form.</p>
          {/* You can add form inputs here later */}
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/30">
              <th className="p-3">User</th>
              <th className="p-3 hidden md:table-cell">Service</th>
              <th className="p-3 hidden md:table-cell">Email</th>
              <th className="p-3">Status</th>
              {selectedTitle === "View All Bookings" && (
                <th className="p-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {getFilteredData().map((user, idx) => (
              <tr key={idx} className="border-b border-white/10">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={user.img || defaultAvatar}
                    onError={(e) => (e.target.src = defaultAvatar)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </td>
                <td className="p-3 hidden md:table-cell">{user.job}</td>
                <td className="p-3 hidden md:table-cell">{user.email}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.status === "Completed"
                        ? "bg-green-500"
                        : user.status === "Rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                {selectedTitle === "View All Bookings" && (
                  <td className="p-3">{renderButtons(user.status)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TableList;
