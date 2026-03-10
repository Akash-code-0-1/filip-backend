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
                  className="flex items-center gap-1.5 bg-[#FBB040] text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-[#f5a623] transition-colors mouse-pointer"
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





// import { useEffect, useState } from "react";
// import { ArrowRight, CheckCircle, Grid3X3 } from "lucide-react";
// import type { RootState, AppDispatch } from "../../store";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEngagementStats } from "../../store/features/engagementSlice";

// export default function DashboardCards() {
//   const dispatch = useDispatch<AppDispatch>();

//   const { pendingApprovals, acceptedJobs, activeUsers, pendingApplications } = useSelector(
//     (state: RootState) => state.engagement
//   );

//   // ------------------- LOCAL STATE FOR MODAL -------------------
//   const [showPendingScreen, setShowPendingScreen] = useState(false);

//   useEffect(() => {
//     dispatch(fetchEngagementStats());
//   }, [dispatch]);

//   const stats = [
//     {
//       title: "Pending Approvals",
//       value: pendingApprovals,
//       type: "pending",
//       onClick: () => setShowPendingScreen(true), // show local screen
//     },
//     {
//       title: "Accepted Jobs",
//       value: acceptedJobs,
//       type: "accepted",
//     },
//     {
//       title: "Active Users",
//       value: activeUsers,
//       type: "active",
//     },
//   ];

//   return (
//     <>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {stats.map((card, idx) => {
//           const isAccepted = card.type === "accepted";
//           const isActive = card.type === "active";

//           return (
//             <div
//               key={idx}
//               className={`rounded-xl p-5 sm:p-6 flex justify-between items-center border ${
//                 isAccepted
//                   ? "bg-[#4CAF50] border-[#4CAF50]"
//                   : "bg-[#1F1F1F] border-[#2a2a2a]"
//               }`}
//             >
//               <div>
//                 <p className={`text-sm mb-1 ${isAccepted ? "text-white/90" : "text-gray-400"}`}>
//                   {card.title}
//                 </p>
//                 <h2 className="text-3xl sm:text-4xl font-bold text-white">{card.value}</h2>
//               </div>

//               {card.type === "pending" && (
//                 <button
//                   onClick={card.onClick}
//                   className="flex items-center gap-1.5 bg-[#FBB040] text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-[#f5a623] transition-colors cursor-pointer"
//                 >
//                   Review <ArrowRight size={16} />
//                 </button>
//               )}

//               {isAccepted && <CheckCircle size={32} className="text-white/80" strokeWidth={1.5} />}
//               {isActive && <Grid3X3 size={32} className="text-[#FBB040]" strokeWidth={1.5} />}
//             </div>
//           );
//         })}
//       </div>

//       {/* ---------------- PENDING APPROVAL SCREEN ---------------- */}
//       {showPendingScreen && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//           <div className="bg-[#1f1f1f] w-full max-w-4xl rounded-2xl p-6 overflow-y-auto max-h-[80vh]">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-[#FBB040]">Pending Applications</h2>
//               <button
//                 onClick={() => setShowPendingScreen(false)}
//                 className="px-4 py-2 rounded-lg bg-[#FBB040] text-black font-medium hover:bg-[#f5a623]"
//               >
//                 Close
//               </button>
//             </div>

//             {pendingApplications.length === 0 && (
//               <p className="text-gray-400">No pending applications</p>
//             )}

//             {pendingApplications.map((app) => (
//               <div
//                 key={app.id}
//                 className="bg-[#2a2a2a] rounded-xl p-5 mb-5 flex flex-col gap-3"
//               >
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={app.applicant?.photo || "https://via.placeholder.com/48"}
//                     alt={app.applicant?.name}
//                     className="w-12 h-12 rounded-full object-cover border-2 border-[#FBB040]"
//                   />
//                   <div>
//                     <p className="font-semibold text-white">{app.applicant?.name}</p>
//                     <p className="text-gray-400 text-sm">
//                       Applied: {new Date(app.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 <hr className="border-gray-700 my-2" />

//                 <div className="flex flex-col gap-1 text-gray-300 text-sm">
//                   <p>
//                     <span className="text-white font-semibold">Job:</span>{" "}
//                     {app.job?.title || "Unknown"}
//                   </p>
//                   <p>
//                     <span className="text-white font-semibold">Target Position:</span>{" "}
//                     {app.job?.targetPosition || "N/A"}
//                   </p>
//                   <p>
//                     <span className="text-white font-semibold">Job Owner:</span>{" "}
//                     {app.jobOwner?.name || "Unknown"}
//                   </p>
//                   <p>
//                     <span className="text-white font-semibold">Status:</span>{" "}
//                     <span className="text-yellow-400 font-semibold">{app.status}</span>
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }