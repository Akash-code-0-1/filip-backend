import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { closePendingModal, fetchPendingApplications, type PendingApplication } from "../../store/features/pendingApprovalsSlice";

/* ---------------- Utility: time ago ---------------- */
function timeAgo(timestamp: number) {
  const now = new Date().getTime();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

export default function PendingApprovalsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const { modalOpen, applications, loading } = useSelector((state: RootState) => state.pendingApprovals);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalOpen) {
      dispatch(fetchPendingApplications()); // Fetch pending applications only when modal opens
    }
  }, [modalOpen, dispatch]);

  // ESC key close
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(closePendingModal());
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [dispatch]);

  if (!modalOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      dispatch(closePendingModal()); // Close modal on outside click
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-[#1f1f1f] w-full max-w-4xl rounded-2xl p-6 overflow-y-auto max-h-[80vh]"
      >
        <h2 className="text-2xl font-bold text-[#FBB040] mb-6">Pending Applications</h2>

        {loading && <p className="text-gray-400">Loading...</p>}
        {!loading && applications.length === 0 && <p className="text-gray-400">No pending applications</p>}

        {!loading && applications.map((app: PendingApplication) => (
          <div key={app.id} className="bg-[#2a2a2a] rounded-xl p-5 mb-5 flex flex-col gap-3">
            {/* Top row: Applicant */}
            <div className="flex items-center gap-4">
              <img
                src={app.applicant?.photo || "https://via.placeholder.com/48"}
                alt={app.applicant?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#FBB040]"
              />
              <div>
                <p className="font-semibold text-white">{app.applicant?.name}</p>
                <p className="text-gray-400 text-sm">Applied: {timeAgo(app.createdAt)}</p>
              </div>
            </div>

            <hr className="border-gray-700 my-2" />

            {/* Job Info */}
            <div className="flex flex-col gap-1 text-gray-300 text-sm">
              <p><span className="text-white font-semibold">Job:</span> {app.job?.title || "Unknown"}</p>
              <p><span className="text-white font-semibold">Target Position:</span> {app.job?.targetPosition || "N/A"}</p>
              <p><span className="text-white font-semibold">Job Owner:</span> {app.jobOwner?.name || "Unknown"}</p>
              <p><span className="text-white font-semibold">Applied On:</span> {new Date(app.createdAt).toLocaleString()}</p>
              <p><span className="text-white font-semibold">Status:</span> <span className="text-yellow-400 font-semibold">{app.status}</span></p>
            </div>
          </div>
        ))}

        <div className="text-right mt-4">
          <button
            onClick={() => dispatch(closePendingModal())}
            className="px-5 py-2 rounded-lg bg-[#FBB040] text-black font-medium hover:bg-[#f5a623]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}