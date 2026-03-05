import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

// Define interfaces for state and job application
interface EngagementState {
  pendingApprovals: number;
  acceptedJobs: number;
  activeUsers: number;
  pendingApplications: JobApplication[];
  pendingModalOpen: boolean;
}

export interface JobApplication {
  id: string;
  applicantId: string;
  jobId: string;
  jobOwnerId: string;
  status: string;
  createdAt: number; // Store as a number (milliseconds)
}

const initialState: EngagementState = {
  pendingApprovals: 0,
  acceptedJobs: 0,
  activeUsers: 0,
  pendingApplications: [],
  pendingModalOpen: false,
};

/* ---- Fetch Engagement Stats ---- */
export const fetchEngagementStats = createAsyncThunk(
  "engagement/fetchStats",
  async (_, { dispatch }) => {
    try {
      // Fetch pending job applications
      const pendingSnap = await getDocs(
        query(collection(firestore, "jobApplications"), where("status", "==", "pending"))
      );
      const pendingApplications: JobApplication[] = pendingSnap.docs.map((doc) => ({
        id: doc.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.seconds
          ? doc.data().createdAt.seconds * 1000 
          : Date.now(), // Default to current time if no timestamp
      }));

      // Fetch accepted job applications from "engagements" collection
      const acceptedSnap = await getDocs(
        query(collection(firestore, "engagements"), where("status", "==", "accepted"))
      );
      const acceptedJobs = acceptedSnap.size; // Simply count the number of accepted jobs

      // Fetch active users
      const activeSnap = await getCountFromServer(
        query(collection(firestore, "users"), where("active", "==", true))
      );
      const activeUsers = activeSnap.data().count;

      // Dispatch action to update the stats in the state
      dispatch(
        setEngagementStats({
          pendingApprovals: pendingApplications.length,
          acceptedJobs, // Just the count of accepted jobs
          activeUsers,
          pendingApplications,
        })
      );
    } catch (err) {
      console.error("Error fetching engagement stats:", err);
    }
  }
);

const engagementSlice = createSlice({
  name: "engagement",
  initialState,
  reducers: {
    setEngagementStats: (state, action: PayloadAction<Partial<EngagementState>>) => {
      state.pendingApprovals = action.payload.pendingApprovals ?? 0;
      state.acceptedJobs = action.payload.acceptedJobs ?? 0;
      state.activeUsers = action.payload.activeUsers ?? 0;
      state.pendingApplications = action.payload.pendingApplications ?? [];
    },
    openPendingModal: (state) => {
      state.pendingModalOpen = true; // Set modal to open
    },
    closePendingModal: (state) => {
      state.pendingModalOpen = false; // Set modal to closed
    },
  },
});

export const { setEngagementStats, openPendingModal, closePendingModal } = engagementSlice.actions;
export default engagementSlice.reducer;

