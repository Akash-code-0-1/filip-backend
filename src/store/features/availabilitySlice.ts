import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

interface Job {
  id: string;
  title: string;
  targetPosition: string;
  description?: string;
  location?: string[];
  status?: string;
  rate?: { amount: number; unit?: string };
  schedule?: { start: string; end: string };
  requiredSkills?: string[];
  userId?: string; // job owner
  acceptedEmployeerId?: string; // worker
}

interface Worker {
  id: string;
  name: string;
  workplace: string;
  until: string;
  ownerName?: string;
}

interface AvailabilityState {
  jobs: Job[];
  calendar: Record<string, number>;
  availableNow: Job[];
  skillCounts: Record<string, number>;
  selectedJob: Job | null;
  modalOpen: boolean;
  currentlyWorking: Worker[];
  loading: boolean;
}

export const fetchJobs = createAsyncThunk<Job[]>(
  "availability/fetchJobs",
  async () => {
    const snapshot = await getDocs(collection(firestore, "jobs"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
  },
);

export const fetchCurrentlyWorking = createAsyncThunk<Worker[]>(
  "availability/fetchCurrentlyWorking",
  async () => {
    const jobsSnapshot = await getDocs(collection(firestore, "jobs"));
    const today = new Date();

    // Collect all unique user IDs
    const userIds = new Set<string>();
    jobsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Job;
      if (data.userId) userIds.add(data.userId);
      if (data.acceptedEmployeerId) userIds.add(data.acceptedEmployeerId);
    });

    const userDocs = await Promise.all(
      Array.from(userIds).map((id) => getDoc(doc(firestore, "users", id))),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMap: Record<string, any> = {};
    userDocs.forEach((userDoc) => {
      if (userDoc.exists()) userMap[userDoc.id] = userDoc.data();
    });

    const workers: Worker[] = [];

    jobsSnapshot.docs.forEach((docSnap) => {
      const jobData = docSnap.data() as Job;

      console.log(jobData);
      console.log("User ID:", jobData.userId);
      console.log("Accepted Employer ID:", jobData.acceptedEmployeerId
);

      // Only include jobs with a valid acceptedEmployeerId
      if (
        !jobData.acceptedEmployeerId ||
        jobData.acceptedEmployeerId.trim() === ""
      )
        return;

      // Check if job is active today
      if (jobData.schedule?.start && jobData.schedule?.end) {
        const startDate = new Date(jobData.schedule.start);
        const endDate = new Date(jobData.schedule.end);
        const nowUtc = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
          ),
        );

        const startUtc = new Date(
          Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
          ),
        );
        const endUtc = new Date(
          Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
          ),
        );

        if (nowUtc < startUtc || nowUtc > endUtc) return;
      }

      const workerUser = userMap[jobData.acceptedEmployeerId];
      const ownerUser = jobData.userId ? userMap[jobData.userId] : null;

      if (!workerUser) return;

      workers.push({
        id: docSnap.id,
        name: workerUser.profile?.name || "Unknown",
        ownerName: ownerUser?.profile?.name,
        workplace: `At: ${jobData.targetPosition || "Unknown Job"}`,
        until: jobData.schedule?.end
          ? `Until ${new Date(jobData.schedule.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "",
      });
    });

    console.log("Currently  Jobs Count:", workers.length); // Debug log
    return workers;
  },
);

const initialState: AvailabilityState = {
  jobs: [],
  calendar: {},
  availableNow: [],
  skillCounts: {},
  selectedJob: null,
  modalOpen: false,
  currentlyWorking: [],
  loading: false,
};

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    openJobModal(state, action: PayloadAction<Job>) {
      state.selectedJob = action.payload;
      state.modalOpen = true;
    },
    closeJobModal(state) {
      state.modalOpen = false;
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;

        const today = new Date();
        const calendar: Record<string, number> = {};
        const availableNow: Job[] = [];
        const skillCounts: Record<string, number> = {};

        action.payload.forEach((job) => {
          if (!job.schedule?.start || !job.schedule?.end) return;

          const start = new Date(job.schedule.start);
          const end = new Date(job.schedule.end);

          if (today >= start && today <= end) {
            availableNow.push(job);
          }

          const current = new Date(start);
          while (current <= end) {
            const key = current.toISOString().split("T")[0];
            calendar[key] = (calendar[key] || 0) + 1;
            current.setDate(current.getDate() + 1);
          }

          job.requiredSkills?.forEach((skill) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });

        state.jobs = action.payload;
        state.calendar = calendar;
        state.availableNow = availableNow;
        state.skillCounts = skillCounts;
      })
      .addCase(fetchCurrentlyWorking.fulfilled, (state, action) => {
        state.currentlyWorking = action.payload;
        console.log();
      });
  },
});

export const { openJobModal, closeJobModal } = availabilitySlice.actions;
export default availabilitySlice.reducer;
