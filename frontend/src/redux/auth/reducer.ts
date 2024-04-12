import type { PayloadAction } from "@reduxjs/toolkit";

import type { AuthStateType } from "./slice";

export default {
  setCurrentUserId(state: AuthStateType, action: PayloadAction<string>) {
    state.userId = action.payload;
  },
};
