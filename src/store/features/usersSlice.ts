import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
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
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

/* ================= TYPES ================= */

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  reason: string;
  createdAt: Date;
}

export interface Membership {
  tier: "free" | "basic" | "premium";
  expiresAt: Date | null;
  startedAt: Date | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  status: "Active" | "Offline";
  rating: number;
  skills: string[];
  avatar: string;
  createdAt: Date;
  credits: {
    balance: number;
  };
  membership: Membership;
}

/* ================= STATE ================= */

interface UsersState {
  all: User[];
  filtered: User[];
  transactions: CreditTransaction[];
  search: string;
  statusFilter: "All" | "Active" | "Offline";
  loading: boolean;
}

const initialState: UsersState = {
  all: [],
  filtered: [],
  transactions: [],
  search: "",
  statusFilter: "All",
  loading: false,
};

/* ================= THUNKS ================= */

// Fetch users
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchUsers",
  async () => {
    const q = query(
      collection(firestore, "users"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = docSnap.data();

      return {
        id: docSnap.id,
        name: data.profile?.name || "Unknown",
        email: data.email || "N/A",
        location: data.profile?.city || "Unknown",
        skills: data.skills || data.profile?.skills || [],
        rating: data.rating || data.profile?.rating || 0,
        avatar:
          data.profile?.photo ||
          "https://via.placeholder.com/40",
        status: data.active ? "Active" : "Offline",
        credits: data.credits || { balance: 0 },
        membership: {
          tier: data.membership?.tier || "free",
          expiresAt: data.membership?.expiresAt
            ? data.membership.expiresAt.toDate()
            : null,
          startedAt: data.membership?.startedAt
            ? data.membership.startedAt.toDate()
            : null,
        },
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  }
);

// Fetch credit transactions
export const fetchTransactions = createAsyncThunk(
  "users/fetchTransactions",
  async (userId: string) => {
    const q = query(
      collection(firestore, "creditTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = d.data();
      return {
        id: d.id,
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

    await updateDoc(userRef, {
      "credits.balance": increment(change),
    });

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

// Assign membership
export const assignMembership = createAsyncThunk(
  "users/assignMembership",
  async ({
    userId,
    tier,
    expiresAt,
  }: {
    userId: string;
    tier: "free" | "basic" | "premium";
    expiresAt: Date | null;
  }) => {
    const userRef = doc(firestore, "users", userId);

    await updateDoc(userRef, {
      membership: {
        tier,
        expiresAt,
        startedAt: tier === "free" ? null : serverTimestamp(),
      },
    });

    return { userId, tier, expiresAt };
  }
);

/* ================= FILTER ================= */

const applyFilters = (state: UsersState) => {
  state.filtered = state.all.filter((u) => {
    const statusMatch =
      state.statusFilter === "All" ||
      u.status === state.statusFilter;

    const text = `${u.name} ${u.email} ${u.skills.join(
      " "
    )}`.toLowerCase();

    return statusMatch && text.includes(state.search);
  });
};

/* ================= SLICE ================= */

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload.toLowerCase();
      applyFilters(state);
    },
    setStatusFilter(
      state,
      action: PayloadAction<UsersState["statusFilter"]>
    ) {
      state.statusFilter = action.payload;
      applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.all = a.payload;
        applyFilters(s);
      })
      .addCase(fetchUsers.rejected, (s) => {
        s.loading = false;
      })

      .addCase(fetchTransactions.fulfilled, (s, a) => {
        s.transactions = a.payload;
      })

      .addCase(adjustCredits.fulfilled, (s, a) => {
        const u = s.all.find(
          (x) => x.id === a.payload.userId
        );
        if (u) u.credits.balance += a.payload.creditChange;
        applyFilters(s);
      })

      .addCase(assignMembership.fulfilled, (s, a) => {
        const u = s.all.find(
          (x) => x.id === a.payload.userId
        );
        if (u) {
          u.membership.tier = a.payload.tier;
          u.membership.expiresAt = a.payload.expiresAt;
        }
      });
  },
});

export const { setSearch, setStatusFilter } =
  usersSlice.actions;

export default usersSlice.reducer;