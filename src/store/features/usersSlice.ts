
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

/* ---------------- TYPES ---------------- */
export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  reason: string;
  createdAt: Date;
}

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
  credits: {
    balance: number;
  };
}

/* ---------------- STATE ---------------- */
interface UsersState {
  all: User[];
  filtered: User[];
  transactions: CreditTransaction[];
  search: string;
  statusFilter: "All" | "Active" | "Pending" | "Suspended";
  loading: boolean;
}

/* ---------------- THUNKS ---------------- */
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchUsers",
  async () => {
    const q = query(collection(firestore, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = docSnap.data();
      return {
        id: docSnap.id,
        name: data.profile?.name || "Unknown",
        email: data.email || "N/A",
        location: data.profile?.city || "Unknown",
        skills: data.skills || data.profile?.skills || [],
        rating: data.rating || data.profile?.rating || 0,
        avatar: data.profile?.photo || "https://via.placeholder.com/40",
        status: data.active ? "Active" : "Suspended",
        credits: data.credits || { balance: 0 },
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      };
    });
  }
);

// Fetch transactions for selected user
export const fetchTransactions = createAsyncThunk(
  "users/fetchTransactions",
  async (userId: string) => {
    const q = query(
      collection(firestore, "creditTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        reason: data.reason,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  }
);

// Adjust credits
export const adjustCredits = createAsyncThunk(
  "users/adjustCredits",
  async ({
    userId,
    amount,
    type,
    reason,
  }: {
    userId: string;
    amount: number;
    type: "add" | "deduct" | "refund" | "bonus";
    reason: string;
  }) => {
    const userRef = doc(firestore, "users", userId);
    const change = type === "deduct" ? -amount : amount;

    // Update user's balance atomically
    await updateDoc(userRef, {
      "credits.balance": increment(change),
    });

    // Log transaction
    await addDoc(collection(firestore, "creditTransactions"), {
      userId,
      amount,
      type,
      reason,
      createdAt: serverTimestamp(),
    });

    return { userId, creditChange: change };
  }
);

/* ---------------- FILTER LOGIC ---------------- */
const applyFilters = (state: UsersState) => {
  state.filtered = state.all.filter((user) => {
    const statusMatch = state.statusFilter === "All" || user.status === state.statusFilter;
    const searchText = `${user.name} ${user.email} ${user.skills.join(" ")}`.toLowerCase();
    return statusMatch && searchText.includes(state.search);
  });
};

/* ---------------- SLICE ---------------- */
const initialState: UsersState = {
  all: [],
  filtered: [],
  transactions: [],
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
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload;
        applyFilters(state);
      })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })

      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      .addCase(adjustCredits.fulfilled, (state, action) => {
        const user = state.all.find(u => u.id === action.payload.userId);
        if (user) user.credits.balance += action.payload.creditChange;
        applyFilters(state);
      });
  },
});

export const { setSearch, setStatusFilter } = usersSlice.actions;
export default usersSlice.reducer;