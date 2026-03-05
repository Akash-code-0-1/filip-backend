import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import type { ReactNode } from "react";

/* ---------------- TYPES ---------------- */
export interface JobNotification {
  description: ReactNode;
  id: string;
  title: string;
  targetPosition: string;
  type: string;
  locations: string[];
  salary: string;
  bannerImage: string;
  createdAt: number;

  user: {
    name: string;
    photo: string;
  };

  isNew: boolean;

  // New fields
  applicationsCount: number;
  positions: {
    filled: number;
    total: number;
  };
  requiredSkills: string[];
  schedule: {
    start: string;
    end: string;
  };
  workplaceType: string;
  status: string;
  visibility: {
    priority: string;
  };
}

interface NotificationsState {
  notifications: JobNotification[];
  unreadCount: number;
  selectedJob: JobNotification | null;
  modalOpen: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  selectedJob: null,
  modalOpen: false,
};

/* ---------------- LISTENER ---------------- */
export const listenToJobNotifications = createAsyncThunk(
  "notifications/listen",
  async (_, { dispatch }) => {
    const q = collection(firestore, "jobs");

    onSnapshot(q, async (snapshot) => {
      const now = Date.now();

      const jobs = await Promise.all(
        snapshot.docs.map(async (jobDoc) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = jobDoc.data() as any;

          // fetch user
          const userSnap = await getDoc(doc(firestore, "users", data.userId));
          const user = userSnap.data();

          const createdAt =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : Date.now();

          return {
            id: jobDoc.id,
            title: data.title,
            targetPosition: data.targetPosition,
            type: data.type,
            locations: data.location || [],
            bannerImage: data.bannerImage,
            salary: `€${data.rate?.amount}/${data.rate?.unit}`,
            createdAt,
            isNew: now - createdAt < 5 * 60 * 1000, // 5 min highlight
            user: {
              name: user?.profile?.name || "Unknown",
              photo:
                user?.profile?.photo ||
                "https://via.placeholder.com/40",
            },
            applicationsCount: data.applicationsCount || 0,
            positions: data.positions || { filled: 0, total: 0 },
            requiredSkills: data.requiredSkills || [],
            schedule: data.schedule || { start: "", end: "" },
            workplaceType: data.workplaceType || "",
            status: data.status || "",
            description: data.description || "No description available",
            visibility: data.visibility || { priority: "" },
          };
        })
      );

      // sort by newest
      dispatch(setNotifications(jobs.sort((a, b) => b.createdAt - a.createdAt)));
    });
  }
);

/* ---------------- SLICE ---------------- */
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<JobNotification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => n.isNew).length;
    },
    openJobModal(state, action: PayloadAction<JobNotification>) {
      state.selectedJob = action.payload;
      state.modalOpen = true;
    },
    closeJobModal(state) {
      state.modalOpen = false;
      state.selectedJob = null;
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => (n.isNew = false));
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  openJobModal,
  closeJobModal,
  markAllAsRead,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;