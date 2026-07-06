import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserPayload {
  uiid: string;
  email: string;
  fullName: string;
  currency: string;
}

interface UserState {
  loginstate: boolean;
  usernuiid: string;
  useremail: string;
  userfullname: string;
  currency: string;
}

const initialState: UserState = {
  loginstate: false,
  usernuiid: "",
  useremail: "",
  userfullname: "",
  currency: "",
};

const userslice = createSlice({
  name: "userslice",
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserPayload>) {
      state.loginstate = true;
      state.usernuiid = action.payload.uiid;
      state.useremail = action.payload.email;
      state.userfullname = action.payload.fullName;
      state.currency = action.payload.currency;
    },
    logout(state) {
      state.loginstate = false;
      state.usernuiid = "";
      state.useremail = "";
      state.userfullname = "";
      state.currency = "";
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
  },
});

export const { login, logout, setCurrency } = userslice.actions;
export default userslice.reducer;
