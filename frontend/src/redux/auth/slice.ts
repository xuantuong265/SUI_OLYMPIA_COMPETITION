import { createSlice } from "@reduxjs/toolkit";

import reducers from "./reducer";

export interface AuthStateType {
  sessionId: number;
}

export const initialState: AuthStateType = {
  sessionId: 0,
};

export const authSlice = createSlice({
  name: "bankAccountSlice",
  initialState,
  reducers,
});

export default authSlice.reducer;
