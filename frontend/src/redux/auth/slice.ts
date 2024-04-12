import { createSlice } from "@reduxjs/toolkit";

import reducers from "./reducer";

export interface AuthStateType {
  sessionId: string;
  userId: string;
}

export const initialState: AuthStateType = {
  sessionId: "",
  userId: "",
};

export const authSlice = createSlice({
  name: "bankAccountSlice",
  initialState,
  reducers,
});

export const { setCurrentUserId } = authSlice.actions;

export default authSlice.reducer;
