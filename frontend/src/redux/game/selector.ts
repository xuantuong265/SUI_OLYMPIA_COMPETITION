import { createSelector } from "@reduxjs/toolkit";

import { type RootState } from "~/store";

const game = (state: RootState) => state.gameReducer;

export const currentStepSelector = createSelector(
  [game],
  (gameState) => gameState.currentStep
);
