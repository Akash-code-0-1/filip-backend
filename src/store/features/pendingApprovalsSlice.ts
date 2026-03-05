import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

/* ---------------- TYPES ---------------- */
export interface PendingApplication {
  id: string;
  applicantId: string;
  jobId: string;
  jobOwnerId: string;
  status: string;
  createdAt: number;

  applicant?: {
    name: string;
    photo: string;
    email?: string;
  };

  job?: {
    title: string;
    targetPosition: string;
    bannerImage?: string;
  };

  jobOwner?: {
    name: string;
    photo?: string;
    email?: string;
  };
}

interface PendingApprovalsState {
  applications: PendingApplication[];
  modalOpen: boolean;
  loading: boolean;
}

const initialState: PendingApprovalsState = {
  applications: [],
  modalOpen: false,
  loading: false,
};

/* ---------------- FETCH PENDING APPLICATIONS ---------------- */
export const fetchPendingApplications = createAsyncThunk(
  "pendingApprovals/fetch",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_, { dispatch }) => {
    const q = query(collection(firestore, "jobApplications"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    const applications: PendingApplication[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = docSnap.data() as any;
        const createdAt =
          data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : Date.now();

        // Fetch applicant info
        const userSnap = await getDoc(doc(firestore, "users", data.applicantId));
        const user = userSnap.data();

        // Fetch job info
        const jobSnap = await getDoc(doc(firestore, "jobs", data.jobId));
        const job = jobSnap.data();

        // Fetch Job Owner info
        const ownerSnap = await getDoc(doc(firestore, "users", data.jobOwnerId));
        const owner = ownerSnap.data();

        return {
          id: docSnap.id,
          applicantId: data.applicantId,
          jobId: data.jobId,
          jobOwnerId: data.jobOwnerId,
          status: data.status,
          createdAt,
          applicant: {
            name: user?.profile?.name || "Unknown",
            photo: user?.profile?.photo || "https://via.placeholder.com/40",
            email: user?.profile?.email || "",
          },
          job: {
            title: job?.title || "",
            targetPosition: job?.targetPosition || "",
            bannerImage: job?.bannerImage || "",
          },
          jobOwner: {
            name: owner?.profile?.name || "Unknown",
            photo: owner?.profile?.photo || "",
            email: owner?.profile?.email || "",
          },
        };
      })
    );

    return applications.sort((a, b) => b.createdAt - a.createdAt);
  }
);

/* ---------------- SLICE ---------------- */
const pendingApprovalsSlice = createSlice({
  name: "pendingApprovals",
  initialState,
  reducers: {
    openPendingModal(state) {
      state.modalOpen = true;
    },
    closePendingModal(state) {
      state.modalOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPendingApplications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPendingApplications.fulfilled, (state, action) => {
      state.loading = false;
      state.applications = action.payload;
    });
    builder.addCase(fetchPendingApplications.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { openPendingModal, closePendingModal } = pendingApprovalsSlice.actions;
export default pendingApprovalsSlice.reducer;