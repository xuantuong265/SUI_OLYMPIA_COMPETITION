import type { PayloadAction } from "@reduxjs/toolkit";

import type { GameStateType } from "./slice";

import type { STEP_GAME_QUIZ } from "~/constants/enum";

export default {
  setCurrentStepGame(
    state: GameStateType,
    action: PayloadAction<STEP_GAME_QUIZ>
  ) {
    state.currentStep = action.payload;
  },
};
