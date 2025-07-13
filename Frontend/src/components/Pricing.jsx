import React from "react";

const PricingCards = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg">
            Whether you're exploring services or managing them, we’ve got a plan for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Basic Plan */}
          <div className="flex flex-col rounded-3xl shadow-lg ring-1 ring-gray-200 transition-all hover:scale-[1.01]">
            <div className="p-8 sm:p-10">
              <h3 className="text-lg font-semibold text-indigo-600">Basic</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                Free
                <span className="ml-1 text-lg">/forever</span>
              </div>
              <p className="mt-6">
                Get started with essential features to search and bookmark services.
              </p>
            </div>
            <div className="flex flex-col flex-1 p-6 rounded-b-3xl">
              <ul className="space-y-4">
                <li className="flex items-start">
                  ✅ Search local service providers
                </li>
                <li className="flex items-start">
                  ✅ Bookmark favorite services
                </li>
                <li className="flex items-start text-red-500">
                  ❌ Priority support
                </li>
                <li className="flex items-start text-red-500">
                  ❌ Verified service providers
                </li>
              </ul>
              <a
                href="/login"
                className="mt-8 w-full inline-block text-center rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-white hover:text-indigo-600 hover:ring-2 hover:ring-indigo-600 transition"
              >
                Start Free
              </a>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="flex flex-col rounded-3xl shadow-lg ring-1 ring-gray-200 transition-all hover:scale-[1.01]">
            <div className="p-8 sm:p-10">
              <h3 className="text-lg font-semibold text-indigo-600">Premium</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                $9
                <span className="ml-1 text-lg">/mo</span>
              </div>
              <p className="mt-6">
                Unlock advanced tools and verified service listings for a smooth experience.
              </p>
            </div>
            <div className="flex flex-col flex-1 p-6 rounded-b-3xl">
              <ul className="space-y-4">
                <li className="flex items-start">
                  ✅ Search & filter providers by category
                </li>
                <li className="flex items-start">
                  ✅ Verified service listings
                </li>
                <li className="flex items-start">
                  ✅ Bookmark and manage favorites
                </li>
                <li className="flex items-start">
                  ✅ Priority customer support
                </li>
              </ul>
              <a
                href="/billing"
                className="mt-8 w-full inline-block text-center rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-white hover:text-indigo-600 hover:ring-2 hover:ring-indigo-600 transition"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCards;
