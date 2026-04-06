import React, { useState } from "react";
import axios from "axios";

export const ContactUsMapForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    sendCopy: true,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await axios.post(
        "https://service-provider-website.onrender.com/api/v1/auth/sendEmail",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }
      );
      setStatus("✅ Message sent successfully!");
      setFormData({ name: "", email: "", message: "", sendCopy: true });
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("❌ Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-32">
      <div
        id="map"
        className="relative h-[300px] overflow-hidden bg-cover bg-[50%] bg-no-repeat"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d229527.6783696065!2d95.304722!3d27.500092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374ec64664d1915b%3A0xb59a6230fd9e338d!2sGuijan%2C%20Assam%20786011!5e0!3m2!1sen!2sin!4v1720866518705!5m2!1sen!2sin"
          width="100%"
          height="480"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="container px-6 md:px-12">
        <div className="block rounded-lg bg-white/80 px-6 py-12 shadow-lg md:py-16 md:px-12 -mt-[100px] backdrop-blur-md border border-gray-300">
          <div className="flex flex-wrap">
            {/* Contact Form */}
            <div className="mb-12 w-full md:px-3 lg:mb-0 lg:w-5/12 lg:px-6">
              <form onSubmit={handleSubmit}>
                <div className="relative mb-6 text-gray-500">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="peer block w-full rounded border-2 bg-transparent py-2 px-3 outline-none transition-all"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="name"
                    className="absolute top-0 left-3 text-gray-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:text-sm peer-focus:translate-y-0 peer-focus:scale-90"
                  >
                    Your Name
                  </label>
                </div>

                <div className="relative mb-6 text-gray-500">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="peer block w-full rounded border-2 bg-transparent py-2 px-3 outline-none transition-all"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute top-0 left-3 text-gray-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:text-sm peer-focus:translate-y-0 peer-focus:scale-90"
                  >
                    Your Email
                  </label>
                </div>

                <div className="relative mb-6 text-gray-500">
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="peer block w-full rounded border-2 bg-transparent py-2 px-3 outline-none transition-all"
                    rows="3"
                    placeholder=" "
                    required
                  ></textarea>
                  <label
                    htmlFor="message"
                    className="absolute top-0 left-3 text-gray-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:text-sm peer-focus:translate-y-0 peer-focus:scale-90"
                  >
                    Message (e.g., Need a plumber near MG Road)
                  </label>
                </div>

                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="sendCopy"
                    checked={formData.sendCopy}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="sendCopy" className="text-sm">
                    Send me a copy of this message
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-sky-500 text-white px-6 py-2 text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {status && (
                  <p className="mt-3 text-sm text-gray-700">{status}</p>
                )}
              </form>
            </div>

            {/* Contact Details */}
            <div className="w-full lg:w-7/12">
              <div className="flex flex-wrap">
                <ContactDetail
                  icon="📧"
                  title="Support Email"
                  value="help@servicefinder.com"
                />
                <ContactDetail
                  icon="📍"
                  title="Office Address"
                  value="123 Service Lane, Sector 45, New Delhi, India"
                />
                <ContactDetail
                  icon="☎️"
                  title="Land Line"
                  value="+91 (011) 456-7890"
                />
                <ContactDetail
                  icon="📱"
                  title="Mobile"
                  value="+91 9876543210"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactDetail = ({ icon, title, value }) => (
  <div className="w-full md:w-6/12 lg:w-full xl:w-6/12 mb-6">
    <div className="flex items-start">
      <div className="bg-sky-200 p-4 rounded-md text-sky-700">{icon}</div>
      <div className="ml-4">
        <p className="font-bold mb-1 text-gray-500">{title}</p>
        <p className="text-sm text-neutral-600 whitespace-pre-line">{value}</p>
      </div>
    </div>
  </div>
);
