import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import {
  Search,
  Users as UsersIcon,
  MapPin,
  Star,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

import {
  fetchUsers,
  setSearch,
  setStatusFilter,
  adjustCredits,
  fetchTransactions,
  type User,
} from "../store/features/usersSlice";

import type { RootState, AppDispatch } from "../store";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { filtered, all, loading, transactions, statusFilter } = useSelector(
    (state: RootState) => state.users
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState("add");
  const [reason, setReason] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const selectUser = (user: User) => {
    setSelectedUser(user);
    dispatch(fetchTransactions(user.id));
  };

  const applyCredit = () => {
    if (!selectedUser) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(adjustCredits({ userId: selectedUser.id, amount, type: type as any, reason }));
    setAmount(0);
    setReason("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#4CAF50]/20 text-[#4CAF50]";
      case "Offline":
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const statsData = [
    { label: "Total Users", value: all.length, icon: UsersIcon },
    { label: "Available", value: all.filter(u => u.status === "Active").length, icon: UsersIcon },
    // { label: "Busy", value: all.filter(u => u.status === "Pending").length, icon: Clock },
    { label: "Offline", value: all.filter(u => u.status === "Offline").length, icon: UsersIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#141414] text-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Users"
          subtitle="Manage user accounts and credits"
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

          {/* Search & Status Filter */}
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
                dispatch(setStatusFilter(statusFilter === "All" ? "Active" : "All"))
              }
              className="flex items-center gap-2 px-4 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl text-sm"
            >
              {statusFilter} <ChevronDown size={16} />
            </button>
          </div>

          {/* Users Grid */}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading users...</p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#FBB040]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
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

                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.skills?.map(skill => (
                      <span key={skill} className="text-xs text-gray-300 bg-[#2a2a2a] px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Credit Info */}
                  <p className="text-xs text-[#FBB040] mt-2">Credits: {user.credits?.balance ?? 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No users found.</p>
          )}

          {/* Credit Admin Panel */}
          {selectedUser && (
            <div className="bg-[#1f1f1f] p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-semibold">Manage Credits — {selectedUser.name}</h2>
              <p className="text-sm text-[#FBB040]">Current Balance: {selectedUser.credits.balance}</p>

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 bg-[#141414] rounded"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 bg-[#141414] rounded"
              >
                <option value="add">Add Credits</option>
                <option value="deduct">Deduct</option>
                <option value="refund">Refund</option>
                <option value="bonus">Promo Bonus</option>
              </select>

              <input
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 bg-[#141414] rounded"
              />

              <button onClick={applyCredit} className="bg-[#FBB040] text-black px-4 py-2 rounded">
                Apply Adjustment
              </button>

              {/* Transaction Table */}
              <h3 className="mt-6 font-semibold">Credit Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-[#2a2a2a]">
                    <tr>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-[#2a2a2a]">
                        <td className="py-2">{t.createdAt.toLocaleDateString()}</td>
                        <td className="py-2 capitalize">{t.type}</td>
                        <td className="py-2 text-[#FBB040]">{t.type === "deduct" ? "-" : "+"}{t.amount}</td>
                        <td className="py-2">{t.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}