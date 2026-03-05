// store/features/updatePasswordSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

/**
 * Payload for updating password
 */
interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface PasswordState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Async thunk to update user password
export const updateUserPassword = createAsyncThunk<
  boolean, // return type
  UpdatePasswordPayload, // argument type
  { rejectValue: string } // reject type
>(
  "password/update",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        return rejectWithValue("User not authenticated");
      }

      // ✅ Firebase-required reauthentication
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // ✅ Update password
      await updatePassword(user, newPassword);

      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Password update error:", error);

      if (error.code === "auth/wrong-password") {
        return rejectWithValue("Current password is incorrect");
      }

      if (error.code === "auth/too-many-requests") {
        return rejectWithValue("Too many attempts. Try later.");
      }

      return rejectWithValue("Failed to update password");
    }
  }
);

const initialState: PasswordState = {
  loading: false,
  success: false,
  error: null,
};

const updatePasswordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    resetPasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(
        updateUserPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to update password";
        }
      );
  },
});

export const { resetPasswordState } = updatePasswordSlice.actions;
export default updatePasswordSlice.reducer;