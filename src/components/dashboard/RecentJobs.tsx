import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { setRecentJobs } from "../../store/features/recentAvailability";
import Card from "./Card";

export default function RecentJobs() {
  const dispatch = useDispatch();
  const recentJobs = useSelector((state: any) => state.jobs.recentJobs);

  const [showAll, setShowAll] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        // Fetch recent 3 jobs
        const jobsQuery = query(
          collection(firestore, "jobs"),
          orderBy("createdAt", "desc"),
          limit(4),
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Get userIds for names
        const userIds = Array.from(new Set(jobsData.map((job) => job.userId)));
        // eslint-disable-next-line prefer-const
        let usersMap: Record<string, string> = {};
        if (userIds.length > 0) {
          const usersQuery = query(
            collection(firestore, "users"),
            where(documentId(), "in", userIds),
          );
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            usersMap[userDoc.id] = userData.profile?.name || "Unknown";
          });
        }

        const formattedJobs = jobsData.map((job) => ({
          id: job.id,
          title: job.targetPosition || "No Position",
          username: usersMap[job.userId] || "Unknown",
          location: Array.isArray(job.location) ? job.location.join(", ") : "",
          rate: job.rate?.amount ? `€${job.rate.amount}` : "N/A",
          date: job.createdAt?.toDate
            ? job.createdAt
                .toDate()
                .toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          status: job.status || "inactive",
        }));

        dispatch(setRecentJobs(formattedJobs));
        setAllJobs(formattedJobs); // Initial recent jobs
      } catch (error) {
        console.error("Error fetching recent jobs:", error);
      }
    };

    fetchRecentJobs();
  }, [dispatch]);

  const fetchAllJobs = async () => {
    try {
      // Fetch all jobs (limit removed)
      const jobsQuery = query(
        collection(firestore, "jobs"),
        orderBy("createdAt", "desc"),
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userIds = Array.from(new Set(jobsData.map((job) => job.userId)));
      let usersMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const usersQuery = query(
          collection(firestore, "users"),
          where(documentId(), "in", userIds),
        );
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          usersMap[userDoc.id] = userData.profile?.name || "Unknown";
        });
      }

      const formattedJobs = jobsData.map((job) => ({
        id: job.id,
        title: job.targetPosition || "No Position",
        username: usersMap[job.userId] || "Unknown",
        location: Array.isArray(job.location) ? job.location.join(", ") : "",
        rate:
          job.rate?.amount && job.currency
            ? `${job.currency === "EUR" ? "€" : job.currency}${job.rate.amount}`
            : "N/A",
        date: job.createdAt?.toDate
          ? job.createdAt
              .toDate()
              .toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "",
        status: job.status || "inactive",
      }));

      setAllJobs(formattedJobs);
      setShowAll(true);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
    }
  };

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-base">Recent Availability Posts</h2>
          <button
            className="text-[#FBB040] text-sm hover:cursor-pointer"
            onClick={fetchAllJobs}
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {recentJobs.map((job, i) => (
            <JobRow key={i} job={job} />
          ))}
        </div>
      </Card>

      {/* Modal for All Jobs */}
      {showAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 overflow-auto">
          <div className="bg-[#1a1a1a] w-11/12 md:w-2/4 lg:w-2/4 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-lg">All Availability Posts</h2>
              <button
                className="text-[#FBB040] text-sm hover:cursor-pointer"
                onClick={() => setShowAll(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {allJobs.map((job, i) => (
                <JobRow key={i} job={job} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Job row component
function JobRow({ job }: { job: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm sm:text-base">{job.title}</p>
            <span
              className={`text-xs ${
                job.status === "active"
                  ? "text-[#4CAF50] bg-[#4CAF50]/20"
                  : "text-red-500 bg-red-500/20"
              } px-2 py-0.5 rounded-full`}
            >
              {job.status === "active" ? "Open" : "Closed"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {job.username} • {job.location}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:text-right flex-shrink-0">
        <p className="text-[#FBB040] font-semibold text-sm sm:text-base">
          {job.rate}
          <span className="text-xs text-[#FBB040]">/Hr</span>
        </p>
        <span className="text-xs text-gray-500">{job.date}</span>
      </div>
    </div>
  );
}
