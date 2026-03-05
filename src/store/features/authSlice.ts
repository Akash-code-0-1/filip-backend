import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface AuthState {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
}

export const loginAdmin = createAsyncThunk<
  Admin,
  LoginArgs,
  { rejectValue: string }
>(
  "auth/loginAdmin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 1️⃣ Firebase Auth login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // 2️⃣ Fetch admin doc by UID
      const adminRef = doc(firestore, "admin", uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        return rejectWithValue("Not an admin account");
      }

      const adminData = { id: uid, ...adminSnap.data() } as Admin;
      localStorage.setItem("admin", JSON.stringify(adminData));

      return adminData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState: AuthState = {
  admin: localStorage.getItem("admin")
    ? JSON.parse(localStorage.getItem("admin")!)
    : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      localStorage.removeItem("admin");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;