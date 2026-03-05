// src/store/features/dashboardSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DashboardState {
  totalUsers: number;
  activeWorkers: number;
  openJobs: number;
  revenue: number;
}

const initialState: DashboardState = {
  totalUsers: 0,
  activeWorkers: 0,
  openJobs: 0,
  revenue: 0,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardStats: (state, action: PayloadAction<DashboardState>) => {
      state.totalUsers = action.payload.totalUsers;
      state.activeWorkers = action.payload.activeWorkers;
      state.openJobs = action.payload.openJobs;
      state.revenue = action.payload.revenue;
    },
  },
});

export const { setDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;