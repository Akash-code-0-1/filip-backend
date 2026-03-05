import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../store";
import { closeJobModal } from "../../store/features/availabilitySlice";
import { MapPin, Clock } from "lucide-react";

export default function JobModal() {
  const dispatch = useDispatch();

  const { selectedJob, modalOpen } = useSelector(
    (state: RootState) => state.availability
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(closeJobModal());
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [dispatch]);

  if (!modalOpen || !selectedJob) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={() => dispatch(closeJobModal())}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl w-full max-w-xl p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#FBB040]">
              {selectedJob.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {selectedJob.targetPosition}
            </p>
          </div>

          <button
            onClick={() => dispatch(closeJobModal())}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          {selectedJob.description}
        </p>

        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-gray-400">
            <MapPin size={14} />
            {selectedJob.location?.length
              ? selectedJob.location.join(", ")
              : "Location not specified"}
          </p>

          <p className="flex items-center gap-2 text-gray-400">
            <Clock size={14} />
            {selectedJob.rate
              ? `${selectedJob.rate.amount}€ / ${selectedJob.rate.unit}`
              : "Rate not specified"}
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => dispatch(closeJobModal())}
            className="px-5 py-2 rounded-lg bg-[#FBB040] text-black font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}