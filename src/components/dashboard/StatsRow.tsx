import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Briefcase, Euro } from "lucide-react";
import Card from "./Card";
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { setDashboardStats } from "../../store/features/dashboardSlice";
import type { RootState} from "../../store";

export default function StatsRow() {
  const dispatch = useDispatch();
  const { totalUsers, activeWorkers, openJobs, revenue } = useSelector(
    (state: RootState) => state.dashboard,
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const totalUsersSnapshot = await getCountFromServer(
          collection(firestore, "users"),
        );
        const totalUsers = totalUsersSnapshot.data().count;

        const activeWorkersSnapshot = await getCountFromServer(
          query(
            collection(firestore, "users"),
            where("profile.openToWork", "==", true),
          ),
        );
        const activeWorkers = activeWorkersSnapshot.data().count;

        const openJobsSnapshot = await getCountFromServer(
          collection(firestore, "jobs"),
        );
        const openJobs = openJobsSnapshot.data().count;

        let totalRevenue = 0;
        try {
          const paymentsSnapshot = await getDocs(
            collection(firestore, "stripePayments"),
          );
          paymentsSnapshot.forEach((doc) => {
            totalRevenue += doc.data().amount;
          });
        } catch {
          totalRevenue = 0;
        }

        dispatch(
          setDashboardStats({
            totalUsers,
            activeWorkers,
            openJobs,
            revenue: totalRevenue,
          }),
        );
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [dispatch]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      iconColor: "#F59E0B",
      bgColor: "rgba(251, 176, 64, 0.15)",
    },
    {
      title: "Active Workers",
      value: activeWorkers,
      icon: Users,
      iconColor: "#4CAF50",
      bgColor: "rgba(76, 175, 80, 0.15)",
    },
    {
      title: "Open Jobs",
      value: openJobs,
      icon: Briefcase,
      iconColor: "#F59E0B",
      bgColor: "rgba(251, 176, 64, 0.15)",
    },
    {
      title: "Revenue",
      value: `€${revenue/100}`,
      icon: Euro,
      iconColor: "#000",
      bgColor: "#9CA3AF",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-400">{stat.title}</p>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: stat.bgColor }}
              >
                <Icon size={18} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
