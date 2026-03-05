import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState} from "../../store";
import { closeJobModal } from "../../store/features/notificationsSlice";

export default function JobNotificationModal() {
  const dispatch = useDispatch();
  const { selectedJob, modalOpen } = useSelector(
    (state: RootState) => state.notifications
  );

  const modalRef = useRef<HTMLDivElement>(null);

  // --- ESC key close ---
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(closeJobModal());
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [dispatch]);

  if (!modalOpen || !selectedJob) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={() => dispatch(closeJobModal())} // outside click
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
      >
        {/* Banner */}
        <div className="h-48 w-full relative">
          <img
            src={selectedJob.bannerImage}
            className="w-full h-full object-cover"
          />

          {/* User profile circle */}
          <div className="absolute bottom-3 left-4 flex justify-center text-center items-center">
            <img
              src={selectedJob.user.photo}
              alt={selectedJob.user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#FBB040]"
            />
            <span className="ml-4">{selectedJob.user.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Job Title & Type */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#FBB040]">
                {selectedJob.title}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedJob.targetPosition} • {selectedJob.type}
              </p>
              {/* User Name under profile */}
              <p className="text-xs text-gray-300 mt-1">{selectedJob.user.name}</p>
            </div>

            {/* Applications Count */}
            <div className="text-sm text-gray-300 text-right">
              <p>Applications</p>
              <p className="font-semibold text-white">{selectedJob.applicationsCount}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300">{selectedJob.description}</p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Locations</p>
              <p>{selectedJob.locations.join(", ")}</p>
            </div>
            <div>
              <p className="text-gray-400">Salary</p>
              <p className="text-[#FBB040] font-semibold">{selectedJob.salary}</p>
            </div>
            <div>
              <p className="text-gray-400">Required Skills</p>
              <p>{selectedJob.requiredSkills.join(", ")}</p>
            </div>
            <div>
              <p className="text-gray-400">Positions</p>
              <p>
                {selectedJob.positions.filled}/{selectedJob.positions.total} filled
              </p>
            </div>
            <div>
              <p className="text-gray-400">Schedule</p>
              <p>
                {new Date(selectedJob.schedule.start).toLocaleDateString()} -{" "}
                {new Date(selectedJob.schedule.end).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Workplace Type</p>
              <p>{selectedJob.workplaceType}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="capitalize">{selectedJob.status}</p>
            </div>
            <div>
              <p className="text-gray-400">Priority</p>
              <p>{selectedJob.visibility.priority}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => dispatch(closeJobModal())}
              className="px-5 py-2 rounded-lg bg-[#FBB040] text-black font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}