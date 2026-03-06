import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  listenToJobNotifications,
  openJobModal,
  markAllAsRead,
} from "../../store/features/notificationsSlice";
import { useEffect, useRef, useState } from "react";
import JobNotificationModal from "../dashboard/JobNotificationModal";

/* -------- time ago helper -------- */
const timeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;

  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

type HeaderProps = {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
};

export default function Header({
  onMenuClick,
  title = "Dashboard",
  subtitle = "Welcome back! Here's what's happening.",
}: HeaderProps) {
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---- start listening to jobs ---- */
  useEffect(() => {
    dispatch(listenToJobNotifications());
  }, [dispatch]);

  /* ---- close on outside click ---- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---- bell click ---- */
  const handleBellClick = () => {
    setOpen((prev) => !prev);
    dispatch(markAllAsRead());
  };

  return (
    <>
      <header className="px-4 md:px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
              <p className="text-sm text-[#9CA3AF] hidden sm:block truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* 🔔 NOTIFICATION */}
            <button
              className="relative flex-shrink-0 hover:opacity-80"
              onClick={handleBellClick}
            >
              <Bell size={20} className="text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 top-12 w-[380px] bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl shadow-2xl z-50">
                <div className="px-4 py-3 font-semibold border-b border-[#2a2a2a]">
                  Job Notifications
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">
                      No notifications
                    </p>
                  )}

                  {notifications.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        dispatch(openJobModal(job));
                        setOpen(false);
                      }}
                      className={`px-4 py-4 cursor-pointer border-b border-[#2a2a2a]
                      ${job.isNew ? "bg-[#FBB040]/10" : "hover:bg-[#2a2a2a]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={job.user.photo}
                          alt={job.user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#FBB040] truncate">
                            {job.targetPosition}
                          </p>

                          <p className="text-xs text-gray-300">
                            Posted by {job.user.name}
                          </p>

                          <p className="text-[11px] text-gray-500 mt-1">
                            {timeAgo(job.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN */}
            <div
              onClick={() => navigate("/settings")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="hidden sm:block text-right">
                <div className="font-medium text-sm">
                  {adminData.firstName} {adminData.lastName}
                </div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
              <img
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                src={
                  adminData.profilePicture || "https://via.placeholder.com/150"
                }
                alt="Admin avatar"
              />
              
            </div>
          </div>
        </div>
      </header>
      <JobNotificationModal />
    </>
  );
}
