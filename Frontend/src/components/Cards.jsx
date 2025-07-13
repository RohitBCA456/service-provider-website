import { Wrench, Lightbulb, BookOpenCheck, Hammer } from "lucide-react";
import { Sparkles } from "lucide-react";
import React from "react";

const features = [
  {
    title: "Plumbing Services",
    description:
      "Quick and reliable plumbing solutions from nearby professionals.",
    color: "#0F0091",
    icon: <Wrench className="w-8 h-8 text-[#0F0091]" />,
  },
  {
    title: "Electricians",
    description: "Certified electricians for home and office electrical needs.",
    color: "#E85F00",
    icon: <Lightbulb className="w-8 h-8 text-[#E85F00]" />,
  },
  {
    title: "Home Cleaning",
    description: "Book professional cleaning services for spotless homes.",
    color: "#09C272",
    icon: <Sparkles className="w-8 h-8 text-[#09C272]" />,
  },
  {
    title: "Carpentry",
    description: "Custom furniture, fixes, and fittings by expert carpenters.",
    color: "#7E0AC4",
    icon: <Hammer className="w-8 h-8 text-[#7E0AC4]" />,
  },
  {
    title: "Tutoring",
    description: "Skilled tutors for academic subjects and competitive exams.",
    color: "#1267D4",
    icon: <BookOpenCheck className="w-8 h-8 text-[#1267D4]" />,
  },
  {
    title: "And More...",
    description:
      "Explore services like AC repair, pest control, beauty & wellness, and more.",
    color: "#BF1495",
    icon: <Lightbulb className="w-8 h-8 text-[#BF1495]" />,
  },
];

const Features = () => {
  return (
    <section className="flex flex-col items-center px-6 sm:px-10 pt-20 pb-12">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6">Popular Services</h2>
      <p className="max-w-2xl text-center text-base sm:text-lg mb-12">
        Discover the most requested services around you and connect with trusted
        professionals.
      </p>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl w-full">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl bg-[#F1F1F1] dark:bg-zinc-800 p-6 w-full sm:w-[320px] h-auto shadow-md 
hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] 
transition-transform duration-300 ease-in-out transform 
cursor-pointer flex flex-col items-start gap-4
"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-zinc-700 w-14 h-14 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm mt-4 text-zinc-600 dark:text-zinc-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
