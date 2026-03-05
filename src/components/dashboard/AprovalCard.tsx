import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, CheckCircle, Grid3X3 } from "lucide-react";
import type { RootState, AppDispatch } from "../../store";
import { openPendingModal } from "../../store/features/engagementSlice"; 
import PendingApprovalsModal from "./PendingApprovalsModal";
import { fetchUsers } from "../../store/features/usersSlice";
import { fetchEngagementStats } from "../../store/features/engagementSlice"; 

export default function DashboardCards() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const { pendingApprovals, acceptedJobs, activeUsers, pendingModalOpen } = useSelector(
    (state: RootState) => state.engagement
  );


  useEffect(() => {
    dispatch(fetchUsers()); 
    dispatch(fetchEngagementStats()); 
  }, [dispatch]);

  const stats = [
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      type: "pending",
      onClick: () => dispatch(openPendingModal()), 
    },
    {
      title: "Accepted Jobs",
      value: acceptedJobs, 
      type: "accepted",
    },
    {
      title: "Active Users",
      value: activeUsers,
      type: "active",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((card, idx) => {
          const isAccepted = card.type === "accepted";
          const isActive = card.type === "active";

          return (
            <div
              key={idx}
              className={`rounded-xl p-5 sm:p-6 flex justify-between items-center border ${
                isAccepted
                  ? "bg-[#4CAF50] border-[#4CAF50]"
                  : "bg-[#1F1F1F] border-[#2a2a2a]"
              }`}
            >
              <div>
                <p
                  className={`text-sm mb-1 ${
                    isAccepted ? "text-white/90" : "text-gray-400"
                  }`}
                >
                  {card.title}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  {card.value}
                </h2>
              </div>

              {/* Button to open pending modal */}
              {/* {card.type === "pending" && (
                <button
                  onClick={card.onClick}
                  className="flex items-center gap-1.5 bg-[#FBB040] text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-[#f5a623] transition-colors"
                >
                  Review <ArrowRight size={16} />
                </button>
              )} */}

              {/* Icon for accepted jobs */}
              {isAccepted && (
                <CheckCircle
                  size={32}
                  className="text-white/80"
                  strokeWidth={1.5}
                />
              )}

              {/* Icon for active users */}
              {isActive && (
                <Grid3X3
                  size={32}
                  className="text-[#FBB040]"
                  strokeWidth={1.5}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Show the modal if it's open */}
      {pendingModalOpen && <PendingApprovalsModal />}
    </>
  );
}