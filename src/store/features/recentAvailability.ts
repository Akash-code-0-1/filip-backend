import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Job {
  id: string;
  title: string;
  username: string;
  location: string;
  rate: string;
  date: string;
  status: string;
}

interface JobsState {
  recentJobs: Job[];
}

const initialState: JobsState = {
  recentJobs: [],
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setRecentJobs: (state, action: PayloadAction<Job[]>) => {
      state.recentJobs = action.payload;
    },
  },
});

export const { setRecentJobs } = jobsSlice.actions;
export default jobsSlice.reducer;