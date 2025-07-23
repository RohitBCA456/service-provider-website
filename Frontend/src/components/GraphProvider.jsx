"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Rectangle,
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import axios from "axios";

// CheckIcon Component
function CheckIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// Step Component
function Step({ step, currentStep }) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  return (
    <motion.div animate={status} className="relative">
      <motion.div
        variants={{
          active: { scale: 1, transition: { delay: 0, duration: 0.2 } },
          complete: { scale: 1.25 },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full bg-blue-200"
      />
      <motion.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "#fff",
            borderColor: "#e5e5e5",
            color: "#a3a3a3",
          },
          active: {
            backgroundColor: "#fff",
            borderColor: "#3b82f6",
            color: "#3b82f6",
          },
          complete: {
            backgroundColor: "#3b82f6",
            borderColor: "#3b82f6",
            color: "#3b82f6",
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold"
      >
        {status === "complete" ? (
          <CheckIcon className="h-6 w-6 text-white" />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

// Main Component
export default function ProviderHome() {
  const [step, setStep] = useState(1);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/bookings/stats", {
          withCredentials: true, // important if using cookies
        });
        setWeeklyData(res.data.weeklyData);
      } catch (err) {
        console.error("Failed to fetch booking stats", err);
      }
    };

    fetchStats();
  }, []);

  const totalBookings = weeklyData.reduce(
    (sum, item) => sum + item.bookings,
    0
  );
  const avgBookings = weeklyData.length
    ? Math.round(totalBookings / weeklyData.length)
    : 0;
  const bookingGoal = 40;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 mt-5">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Provider Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row flex-wrap gap-6">
        {/* Left Chart Panel */}
        <div className="w-full lg:w-1/2 bg-white p-5 sm:p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">
            {totalBookings}{" "}
            <span className="text-sm font-normal text-gray-400">bookings</span>
          </div>

          <div className="mt-6 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ left: -10, right: -10 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
                <Bar
                  dataKey="bookings"
                  fill="#3B82F6"
                  radius={[5, 5, 0, 0]}
                  activeBar={<Rectangle fill="#2563EB" />}
                />
                <ReferenceLine
                  y={avgBookings}
                  stroke="#999"
                  strokeDasharray="3 3"
                >
                  <Label
                    value={`Avg: ${avgBookings}`}
                    position="insideTopLeft"
                    offset={10}
                    fill="#333"
                  />
                </ReferenceLine>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Over the past 7 days, you received{" "}
            <span className="font-semibold text-black">{totalBookings}</span>{" "}
            bookings.
          </div>
          <div className="text-sm text-gray-600">
            You need{" "}
            <span className="font-semibold text-black">
              {Math.max(0, bookingGoal - totalBookings)}
            </span>{" "}
            more bookings to hit your goal of {bookingGoal}.
          </div>
        </div>

        {/* Right Wizard Panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex justify-between rounded p-6 sm:p-8">
              <Step step={1} currentStep={step} />
              <Step step={2} currentStep={step} />
              <Step step={3} currentStep={step} />
              <Step step={4} currentStep={step} />
            </div>

            <div className="space-y-4 px-6 sm:px-8 pb-4">
              {step === 1 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    New Bookings
                  </h2>
                  <p className="text-gray-600">
                    View bookings that are currently marked as{" "}
                    <strong>pending</strong>.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Accepted Bookings
                  </h2>
                  <p className="text-gray-600">
                    See the list of <strong>accepted bookings</strong> and their
                    upcoming dates.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Rejected Bookings
                  </h2>
                  <p className="text-gray-600">
                    Review bookings that were <strong>declined</strong> or{" "}
                    <strong>expired</strong>.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Add New Services
                  </h2>
                  <p className="text-gray-600">
                    Add a new service like <strong>plumbing</strong> or{" "}
                    <strong>AC repair</strong> with pricing.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(step < 2 ? step : step - 1)}
                  className={`${
                    step === 1 ? "pointer-events-none opacity-50" : ""
                  } duration-300 rounded px-2 py-1 text-neutral-400 transition hover:text-neutral-700`}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(step >= 4 ? step : step + 1)}
                  className={`${
                    step >= 4 ? "pointer-events-none opacity-50" : ""
                  } duration-300 flex items-center justify-center rounded-full bg-blue-500 py-1.5 px-4 font-medium text-white transition hover:bg-blue-600 active:bg-blue-700`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
