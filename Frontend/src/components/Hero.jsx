import React, { useEffect, useState } from "react";

const HeroSection = () => {

  return (
    <section className="relative overflow-hidden py-20 px-6 sm:px-10 lg:px-20">
      {/* Decorative SVG */}
      <svg
        viewBox="0 0 1024 1024"
        className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 blur-3xl opacity-60 dark:opacity-30"
        aria-hidden="true"
      >
        <circle
          cx="512"
          cy="512"
          r="512"
          fill="url(#hero-gradient)"
          fillOpacity="0.7"
        />
        <defs>
          <radialGradient
            id="hero-gradient"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(512 512) rotate(90) scale(512)"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#9333ea" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className= "text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Find Local Services Instantly
        </h1>
        <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto">
          Connect with trusted professionals near you. Book electricians,
          tutors, cleaners and more — all in one place.
        </p>

        {/* Form */}
        <form className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="w-full sm:w-80 rounded-md border border-gray-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-800 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full sm:w-auto rounded-md bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-semibold shadow-md transition-colors"
          >
            Notify Me
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
