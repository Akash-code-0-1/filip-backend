import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

/* ---------------- TYPES ---------------- */
export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  status: "Active" | "Pending" | "Suspended";
  rating: number;
  skills: string[];
  avatar: string;
  createdAt: Date;
}

interface UsersState {
  all: User[];
  filtered: User[];
  search: string;
  statusFilter: "All" | "Active" | "Pending" | "Suspended";
  loading: boolean;
}

/* ---------------- THUNK ---------------- */
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchUsers",
  async () => {
    const q = query(
      collection(firestore, "users"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = doc.data() as any;
      return {
        id: doc.id,
        name: data.profile?.name || "Unknown",
        email: data.email || "N/A",
        location: data.profile?.city || "Unknown",
        skills: data.skills || data.profile?.skills || [], // <-- FIXED
        rating: data.rating || data.profile?.rating,
        avatar: data.profile?.photo || "https://via.placeholder.com/40",
        status: data.active ? "Active" : "Suspended",
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      };
    });
  },
);

/* ---------------- FILTER LOGIC ---------------- */
const applyFilters = (state: UsersState) => {
  state.filtered = state.all.filter((user) => {
    const statusMatch =
      state.statusFilter === "All" || user.status === state.statusFilter;
    const searchText =
      `${user.name} ${user.email} ${user.skills.join(" ")}`.toLowerCase();
    const searchMatch = searchText.includes(state.search);
    return statusMatch && searchMatch;
  });
};

/* ---------------- SLICE ---------------- */
const initialState: UsersState = {
  all: [],
  filtered: [],
  search: "",
  statusFilter: "All",
  loading: false,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload.toLowerCase();
      applyFilters(state);
    },
    setStatusFilter(state, action: PayloadAction<UsersState["statusFilter"]>) {
      state.statusFilter = action.payload;
      applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload;
        state.filtered = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSearch, setStatusFilter } = usersSlice.actions;
export default usersSlice.reducer;
