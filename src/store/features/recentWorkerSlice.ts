// src/store/features/recentWorkerSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Worker {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  rating: number;
  avatar: string;
  status: string;
}

interface RecentWorkerState {
  recentWorkers: Worker[];
}

const initialState: RecentWorkerState = {
  recentWorkers: [],
};

const recentWorkerSlice = createSlice({
  name: "recentWorker",
  initialState,
  reducers: {
    setRecentWorkers: (state, action: PayloadAction<Worker[]>) => {
      state.recentWorkers = action.payload;
    },
  },
});

export const { setRecentWorkers } = recentWorkerSlice.actions;
export default recentWorkerSlice.reducer;