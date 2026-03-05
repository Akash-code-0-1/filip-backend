import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

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
  createdAt: number;
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
      // Pending approvals
      const pendingSnap = await getDocs(query(collection(firestore, "jobApplications"), where("status", "==", "pending")));
      const pendingApplications: JobApplication[] = pendingSnap.docs.map(doc => ({
        id: doc.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.seconds ? doc.data().createdAt.seconds * 1000 : Date.now(),
      }));

      // Accepted jobs
      const acceptedSnap = await getDocs(query(collection(firestore, "jobApplications"), where("status", "==", "accepted")));
      const acceptedJobs = acceptedSnap.size;

      // Active users
      const activeSnap = await getCountFromServer(query(collection(firestore, "users"), where("active", "==", true)));
      const activeUsers = activeSnap.data().count;

      dispatch(setEngagementStats({
        pendingApprovals: pendingApplications.length,
        acceptedJobs,
        activeUsers,
        pendingApplications
      }));
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
      state.pendingModalOpen = true;
    },
    closePendingModal: (state) => {
      state.pendingModalOpen = false;
    },
  },
});

export const { setEngagementStats, openPendingModal, closePendingModal } = engagementSlice.actions;
export default engagementSlice.reducer;