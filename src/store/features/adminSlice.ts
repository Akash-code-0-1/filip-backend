import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profilePicture: "",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateProfileInfo: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateProfilePicture: (state, action) => {
      state.profilePicture = action.payload;
    },
  },
});

export const { updateProfileInfo, updateProfilePicture } = adminSlice.actions;
export default adminSlice.reducer;
