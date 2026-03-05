import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import {
  Search,
  Users as UsersIcon,
  Clock,
  ChevronDown,
  MapPin,
  Star,
  MoreVertical,
} from "lucide-react";
import { fetchUsers, setSearch, setStatusFilter, type User } from "../store/features/usersSlice";
import type { RootState, AppDispatch } from "../store";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { filtered, all, loading, statusFilter } = useSelector(
    (state: RootState) => state.users
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#4CAF50]/20 text-[#4CAF50]";
      case "Pending":
        return "bg-[#FBB040]/20 text-[#FBB040]";
      case "Suspended":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const statsData = [
    { label: "Total Users", value: all.length, icon: UsersIcon },
    { label: "Available", value: all.filter(u => u.status === "Active").length, icon: UsersIcon },
    { label: "Busy", value: all.filter(u => u.status === "Pending").length, icon: Clock },
    { label: "Offline", value: all.filter(u => u.status === "Suspended").length, icon: UsersIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#141414] text-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Users"
          subtitle="Manage user accounts and availability"
        />

        <main className="p-4 md:p-6 space-y-5 overflow-x-hidden">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((s) => (
              <div key={s.label} className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-3">
                <s.icon size={20} className="text-gray-400" />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search User By Name, Email, Skills..."
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl text-sm"
              />
            </div>

            <button
              onClick={() =>
                dispatch(
                  setStatusFilter(
                    statusFilter === "All" ? "Active" : "All"
                  )
                )
              }
              className="flex items-center gap-2 px-4 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl text-sm"
            >
              {statusFilter} <ChevronDown size={16} />
            </button>
          </div>

          {/* Users List */}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading users...</p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((user: User) => (
                <div key={user.id} className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{user.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                          <div className="flex items-center gap-1 text-[#FBB040] text-sm">
                            <Star size={12} fill="#FBB040" />
                            <span>{user.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <MoreVertical size={16} className="text-gray-400" />
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin size={12} /> {user.location}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs text-gray-300 bg-[#2a2a2a] px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No users found.</p>
          )}
        </main>
      </div>
    </div>
  );
}