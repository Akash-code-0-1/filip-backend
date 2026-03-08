import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, query, orderBy, limit, where, getDocs } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { setRecentWorkers, type Worker } from "../../store/features/recentWorkerSlice";
import Card from "./Card";
import { Star, MapPin } from "lucide-react";
import type { RootState, AppDispatch } from "../../store";

export default function RecentWorkers() {
  const dispatch = useDispatch<AppDispatch>();
  const recentWorkers = useSelector((state: RootState) => state.workers.recentWorkers);

  const [showAll, setShowAll] = useState(false);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchRecentWorkers = async () => {
      try {
        const workersQuery = query(
          collection(firestore, "users"),
          where("active", "==", true),
          orderBy("createdAt", "desc"),
          limit(4)
        );

        const snapshot = await getDocs(workersQuery);
        const workersData: Worker[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.profile?.name || "Unknown",
            email: data.email || "N/A",
            location: data.profile?.city || "Unknown",
            skills: data.skills || [],
            rating: data.profile?.rating,
            avatar: data.profile?.photo || "https://via.placeholder.com/40",
            status: data.active ? "Active" : "Inactive",
          };
        });

        dispatch(setRecentWorkers(workersData));
        setAllWorkers(workersData);
      } catch (error) {
        console.error("Error fetching recent workers:", error);
      }
    };

    fetchRecentWorkers();
  }, [dispatch]);

  const fetchAllWorkers = async () => {
    try {
      const workersQuery = query(
        collection(firestore, "users"),
        where("active", "==", true),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(workersQuery);
      const workersData: Worker[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.profile?.name || "Unknown",
          email: data.email || "N/A",
          location: data.profile?.city || "Unknown",
          skills: data.skills || [],
          rating: data.profile?.rating,
          avatar: data.profile?.photo || "https://via.placeholder.com/40",
          status: data.active ? "Active" : "Inactive",
        };
      });

      setAllWorkers(workersData);
      setShowAll(true);
    } catch (error) {
      console.error("Error fetching all workers:", error);
    }
  };

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-base">Recent Workers</h2>
          <button
            className="text-[#FBB040] text-sm hover:cursor-pointer"
            onClick={fetchAllWorkers}
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentWorkers.map((w) => (
            <WorkerRow key={w.id} worker={w} />
          ))}
        </div>
      </Card>

      {/* Modal for All Workers */}
      {showAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 overflow-auto">
          <div className="bg-[#1a1a1a] w-11/12 md:w-2/4 lg:w-2/4 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg">All Workers</h2>
              <button
                className="text-[#FBB040] text-sm hover:cursor-pointer"
                onClick={() => setShowAll(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {allWorkers.map((w) => (
                <WorkerRow key={w.id} worker={w} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Worker row component
function WorkerRow({ worker }: { worker: Worker }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <div className="flex gap-3 min-w-0">
        <img
          src={worker.avatar}
          alt={worker.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm">{worker.name}</p>
            <span className="text-xs text-[#4CAF50] bg-[#4CAF50]/20 px-2 py-0.5 rounded-full">
              {worker.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{worker.email}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={10} />
            {worker.location}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {worker.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs text-gray-300 bg-[#2a2a2a] px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[#FBB040] bg-[#FBB040]/10 px-2 py-1 rounded flex-shrink-0">
        <Star size={12} fill="#FBB040" />
        <span className="text-sm font-medium">{worker.rating}</span>
      </div>
    </div>
  );
}