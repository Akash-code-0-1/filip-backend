import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import adminReducer from "./features/adminSlice";
import dashboardReducer from "./features/dashboardSlice";
import engagementReducer from "./features/engagementSlice";
import recentAvailabilityReducer from "./features/recentAvailability";
import recentWorkerReducer from "./features/recentWorkerSlice";
import updatePasswordReducer from "./features/updatePasswordSlice";
import availabilityReducer from "./features/availabilitySlice";
import usersReducer from "./features/usersSlice";
import notificationsReducer from "./features/notificationsSlice";
import pendingApprovalsRerucer from "./features/pendingApprovalsSlice";
import reviewsReducer from "./features/reviewsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    dashboard: dashboardReducer,
    engagement: engagementReducer,
    jobs: recentAvailabilityReducer,
    workers: recentWorkerReducer,
    password: updatePasswordReducer,
    availability: availabilityReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    pendingApprovals: pendingApprovalsRerucer,
    reviews: reviewsReducer
  },
});

// Type helpers for TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;