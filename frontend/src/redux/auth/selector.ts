import { createSelector } from "@reduxjs/toolkit";

import { type RootState } from "~/store";

const auth = (state: RootState) => state.authReducer;

export const currentUserIdSelector = createSelector(
  [auth],
  (authState) => authState.userId
);
