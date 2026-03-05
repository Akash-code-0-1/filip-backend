// store/features/availabilitySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

// Job type
interface Job {
  id: string;
  title: string;
  schedule?: {
    start: string;
    end: string;
  };
  location?: string[];
  rate?: {
    amount: number;
    currency?: string;
  };
  requiredSkills?: string[];
}

// AvailableNow item
interface AvailableNowItem {
  name: string;
  location: string;
  rate: string;
  experience: string;
}

// Slice state type
interface AvailabilityState {
  jobs: Job[];
  calendar: Record<string, number>;
  availableNow: AvailableNowItem[];
  skillCounts: Record<string, number>;
  loading: boolean;
}

// Fetch jobs from Firestore
export const fetchJobs = createAsyncThunk<Job[]>(
  "availability/fetchJobs",
  async () => {
    const snapshot = await getDocs(collection(firestore, "jobs"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job));
  }
);

// Helper: get all dates in range
const getDatesInRange = (start: string, end: string) => {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]); // YYYY-MM-DD
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const initialState: AvailabilityState = {
  jobs: [],
  calendar: {},       // {"2026-03-04": 5}
  availableNow: [],   // jobs active today
  skillCounts: {},    // {"Bartending": 5}
  loading: false,
};

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;

        const calendarCount: Record<string, number> = {};
        const today = new Date().toISOString().split("T")[0];
        const availableNow: AvailableNowItem[] = [];
        const skillCounts: Record<string, number> = {};

        action.payload.forEach((job) => {
          if (!job.schedule?.start || !job.schedule?.end) return;

          // Calendar
          const dates = getDatesInRange(job.schedule.start, job.schedule.end);
          dates.forEach((date) => {
            calendarCount[date] = (calendarCount[date] || 0) + 1;
          });

          // Available now
          if (dates.includes(today)) {
            availableNow.push({
              name: job.title,
              location: job.location?.join(", ") || "Unknown",
              rate: job.rate?.amount ? `€${job.rate.amount}` : "N/A",
              experience: job.requiredSkills?.join(", ") || "N/A",
            });
          }

          // Skill counts
          job.requiredSkills?.forEach((skill) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });

        state.calendar = calendarCount;
        state.availableNow = availableNow;
        state.skillCounts = skillCounts;
      });
  },
});

export default availabilitySlice.reducer;