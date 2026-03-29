import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profilePicture: "",
  paymentEnabled: false, // add this here
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
    setPaymentEnabled: (state, action) => { // add this here
      state.paymentEnabled = action.payload; // and this
    }, //donot forget to close akash
  },
});

export const { updateProfileInfo, updateProfilePicture, setPaymentEnabled } = adminSlice.actions; // export o kintu kora lagbo bujis
export default adminSlice.reducer;