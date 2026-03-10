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
} from "lucide-react";
import {
  fetchUsers,
  setSearch,
  setStatusFilter,
  adjustCredits,
  fetchTransactions,
  assignMembership,
  type User,
} from "../store/features/usersSlice";

import type { RootState, AppDispatch } from "../store";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { filtered, all, loading, transactions, statusFilter } = useSelector(
    (state: RootState) => state.users,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"add" | "deduct" | "refund" | "bonus">(
    "add",
  );
  const [reason, setReason] = useState("");

  const [tier, setTier] = useState<"free" | "basic" | "premium">("free");
  const [duration, setDuration] = useState<1 | 3 | 12 | "custom">(1);
  const [customExpiry, setCustomExpiry] = useState("");

  // NEW: Loading state for buttons
  const [isApplyingCredit, setIsApplyingCredit] = useState(false);
  const [isAssigningMembership, setIsAssigningMembership] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const selectUser = (user: User) => {
    setSelectedUser(user);
    dispatch(fetchTransactions(user.id));
    setTier(user.membership?.tier || "free");
  };

  const applyCredit = async () => {
    if (!selectedUser) return;
    setIsApplyingCredit(true);

    await dispatch(
      adjustCredits({
        userId: selectedUser.id,
        amount,
        type,
        reason,
      }),
    );

    // ✅ REFRESH TRANSACTIONS IMMEDIATELY
    dispatch(fetchTransactions(selectedUser.id));

    setAmount(0);
    setReason("");
    setIsApplyingCredit(false);
  };

  const applyMembership = async () => {
    if (!selectedUser) return;
    setIsAssigningMembership(true);

    let expiresAt: Date | null = null;

    if (tier !== "free") {
      if (duration === "custom") {
        expiresAt = customExpiry ? new Date(customExpiry) : null;
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() + duration);
        expiresAt = d;
      }
    }

    // Dispatch membership assignment
    await dispatch(
      assignMembership({
        userId: selectedUser.id,
        tier,
        expiresAt,
      }),
    );

    // Immediately update local selectedUser state according to rules
    setSelectedUser((prev) => {
      if (!prev) return null;

      let newBalance = prev.credits.balance;
      let newLifetime = prev.credits.lifetimeEarned || 0;

      switch (tier) {
        case "basic":
          // Free → Basic: +50 to lifetime & balance
          newBalance += 50;
          newLifetime += 50;
          break;
        case "premium":
          // Free → Premium: huge credits
          newBalance = 999999999999;
          break;
        case "free":
          // Any → Free: 10 credits
          newBalance = 10;
          newLifetime = 10;
          break;
      }

      return {
        ...prev,
        membership: {
          tier,
          expiresAt,
          startedAt:
            tier === "free" ? null : prev.membership.startedAt || new Date(),
        },
        credits: {
          ...prev.credits,
          balance: newBalance,
          lifetimeEarned: newLifetime,
        },
      };
    });

    setIsAssigningMembership(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#4CAF50]/20 text-[#4CAF50]";
      case "Offline":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "";
    }
  };

  const getTierUI = (tier: string) => {
    switch (tier) {
      case "premium":
        return {
          color: "bg-[#FBB040]/20 text-[#FBB040]",
          icon: <Star size={12} fill="#FBB040" />,
        };
      case "basic":
        return {
          color: "bg-blue-500/20 text-blue-400",
          icon: <Star size={12} />,
        };
      default:
        return {
          color: "bg-gray-600/20 text-gray-400",
          icon: <UsersIcon size={12} />,
        };
    }
  };

  const statsData = [
    { label: "Total Users", value: all.length, icon: UsersIcon },
    {
      label: "Available",
      value: all.filter((u) => u.status === "Active").length,
      icon: UsersIcon,
    },
    {
      label: "Offline",
      value: all.filter((u) => u.status === "Offline").length,
      icon: UsersIcon,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#141414] text-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Users"
          subtitle="Manage user accounts, credits & memberships"
        />

        <main className="p-4 md:p-6 space-y-5 overflow-x-hidden">
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((s) => (
              <div
                key={s.label}
                className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-3"
              >
                <s.icon size={20} className="text-gray-400" />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search User By Name, Email, Skills..."
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl text-sm"
              />
            </div>

            <button
              onClick={() =>
                dispatch(
                  setStatusFilter(statusFilter === "All" ? "Active" : "All"),
                )
              }
              className="flex items-center gap-2 px-4 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl text-sm cursor-pointer"
            >
              {statusFilter} <ChevronDown size={16} />
            </button>
          </div>

          {/* USERS GRID */}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading users...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((user) => {
                const tierUI = getTierUI(user.membership?.tier || "free");
                const isSelected = selectedUser?.id === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`bg-[#1f1f1f] border rounded-xl p-4 cursor-pointer transition
                      ${
                        isSelected
                          ? "border-[#FBB040]"
                          : "border-[#2a2a2a] hover:border-[#FBB040]"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={user.avatar}
                        className="w-11 h-11 rounded-full object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{user.name}</p>

                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                              user.status,
                            )}`}
                          >
                            {user.status}
                          </span>

                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full capitalize ${tierUI.color}`}
                          >
                            {tierUI.icon}
                            {user.membership?.tier || "free"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} /> {user.location}
                      </div>

                      <div className="flex items-center gap-1 text-[#FBB040]">
                        <Star size={12} fill="#FBB040" />
                        {user.rating}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs text-gray-300 bg-[#2a2a2a] px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[#FBB040] mt-3">
                      Credits: {user.credits?.balance ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ADMIN PANELS*/}
          {selectedUser && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* CREDIT PANEL */}
              <div className="bg-[#1f1f1f] p-6 rounded-xl space-y-4 border border-[#2a2a2a]">
                <h2 className="text-lg font-semibold">
                  Manage Credits — {selectedUser.name}
                </h2>

                <p className="text-sm text-[#FBB040]">
                  Current Credits: {selectedUser.credits.balance}
                </p>

                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#141414] rounded"
                />

                <select
                  value={type}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setType(e.target.value as any)}
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

                <button
                  onClick={applyCredit}
                  disabled={isApplyingCredit}
                  className={`px-4 py-2 rounded font-medium transition
                    ${
                      isApplyingCredit
                        ? "bg-[#FBB040]/80 text-black cursor-not-allowed"
                        : "bg-[#FBB040] text-black hover:bg-[#fbc14a] cursor-pointer"
                    }
                  `}
                >
                  {isApplyingCredit ? "Applying..." : "Apply Adjustment"}
                </button>

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
                          <td className="py-2">
                            {t.createdAt.toLocaleDateString()}
                          </td>
                          <td className="py-2 capitalize">{t.type}</td>
                          <td className="py-2 text-[#FBB040]">
                            {t.type === "deduct" ? "-" : "+"}
                            {t.amount}
                          </td>
                          <td className="py-2">{t.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MEMBERSHIP PANEL */}
              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-[#2a2a2a] space-y-5">
                <h2 className="text-lg font-semibold">Membership Management</h2>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    Current Tier:{" "}
                    <span className="text-[#FBB040] capitalize">
                      {selectedUser.membership?.tier || "free"}
                    </span>
                  </p>

                  {selectedUser.membership?.expiresAt && (
                    <p>
                      Expires On:{" "}
                      {new Date(
                        selectedUser.membership.expiresAt,
                      ).toLocaleDateString()}
                    </p>
                  )}

                  <p>Credits: {selectedUser.credits?.balance ?? 0}</p>
                </div>

                <select
                  value={tier}
                  onChange={(e) =>
                    setTier(e.target.value as "free" | "basic" | "premium")
                  }
                  className="w-full p-2 bg-[#141414] rounded"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>

                <select
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value === "custom"
                        ? "custom"
                        : (Number(e.target.value) as 1 | 3 | 12),
                    )
                  }
                  className="w-full p-2 bg-[#141414] rounded"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={12}>12 Months</option>
                  <option value="custom">Custom Expiry</option>
                </select>

                {duration === "custom" && (
                  <input
                    type="date"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="w-full p-2 bg-[#141414] rounded"
                  />
                )}

                <button
                  onClick={applyMembership}
                  disabled={isAssigningMembership}
                  className={`px-4 py-2 rounded font-medium transition
                    ${
                      isAssigningMembership
                        ? "bg-[#FBB040]/80 text-black cursor-not-allowed"
                        : "bg-[#FBB040] text-black hover:bg-[#fbc14a] cursor-pointer"
                    }
                  `}
                >
                  {isAssigningMembership ? "Assigning..." : "Assign Membership"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
