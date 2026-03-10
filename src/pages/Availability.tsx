
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Calendar, Clock, MapPin } from "lucide-react";
import {
  fetchJobs,
  fetchCurrentlyWorking,
  openJobModal,
} from "../store/features/availabilitySlice";
import type { RootState, AppDispatch } from "../store";
import JobModal from "../components/dashboard/JobModal";

export default function Availability() {
  const dispatch = useDispatch<AppDispatch>();
  const { calendar, loading, availableNow, skillCounts, currentlyWorking } =
    useSelector((state: RootState) => state.availability);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCurrentlyWorking());
  }, [dispatch]);

  // Week Overview
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() + index);
    const key = date.toISOString().split("T")[0];
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      available: calendar[key] || 0,
    };
  });

  // Skill availability array for UI
  const skillAvailability = Object.keys(skillCounts).map((skill) => ({
    skill,
    count: skillCounts[skill],
  }));

  return (
    <>
      <div className="flex min-h-screen bg-[#141414] text-gray-100">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title="Availability"
            subtitle="Track jobs & workers availability in real-time"
          />

          <main className="p-4 md:p-6 space-y-5 overflow-x-hidden">
            {/* Week Overview */}
            <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-gray-400" />
                <h3 className="font-semibold">Week Overview</h3>
              </div>
              {loading ? (
                <p className="text-gray-400 text-sm">Loading jobs...</p>
              ) : (
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                  {weekDays.map((item, index) => (
                    <button
                      key={item.day}
                      onClick={() => setSelectedDay(index)}
                      className={`p-2 sm:p-3 rounded-xl text-center transition-colors ${
                        selectedDay === index
                          ? "bg-[#FBB040] text-black"
                          : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                      }`}
                    >
                      <p className="text-xs sm:text-sm">{item.day}</p>
                      <p className="text-lg sm:text-2xl font-bold my-1">
                        {item.date}
                      </p>
                      <p
                        className={`text-[8px] lg:text-xs ${
                          selectedDay === index
                            ? "text-black/70"
                            : "text-[#4CAF50]"
                        }`}
                      >
                        {item.available} available
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Available Now */}
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                    <h3 className="font-semibold">Jobs Available Now</h3>
                  </div>
                  <span className="text-xs bg-[#4CAF50]/20 text-[#4CAF50] px-3 py-1 rounded-full">
                    {availableNow.length} Jobs
                  </span>
                </div>
                <div className="space-y-3">
                  {availableNow.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => dispatch(openJobModal(job))}
                      className="cursor-pointer p-4 bg-[#2a2a2a]/60 rounded-xl border border-[#3a3a3a] hover:border-[#FBB040] transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {job.targetPosition}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {job.targetPosition}
                          </p>
                        </div>

                        <span className="text-[#FBB040] font-semibold text-sm">
                          €{job.rate?.amount}
                          <span className="text-xs text-gray-400">
                            /{job.rate?.unit}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {job.location?.join(", ")}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Active
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currently Working */}
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#FBB040]" />
                    <h3 className="font-semibold">Currently Working</h3>
                  </div>
                  <span className="text-xs bg-[#FBB040]/20 text-[#FBB040] px-3 py-1 rounded-full">
                    {currentlyWorking.length} Workers
                  </span>
                </div>
                {currentlyWorking.length === 0 ? (
                  <p className="text-gray-400 text-sm">No workers currently active.</p>
                ) : (
                  <div className="space-y-3">
                    {currentlyWorking.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex flex-col p-3 bg-[#2a2a2a]/50 rounded-lg border-l-2 border-[#4CAF50]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-white">
                              {worker.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {worker.workplace}
                            </p>
                            {worker.ownerName && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Owner: {worker.ownerName}
                              </p>
                            )}
                          </div>
                          <span className="text-xs bg-[#2a2a2a] text-gray-300 px-3 py-1.5 rounded-full">
                            {worker.until}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skill Availability */}
            <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
              <h3 className="font-semibold mb-4">Skill Availability</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {skillAvailability.map((item) => (
                  <div
                    key={item.skill}
                    className="bg-[#2a2a2a]/50 border border-[#3a3a3a] rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {item.count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.skill}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <JobModal />
    </>
  );
}