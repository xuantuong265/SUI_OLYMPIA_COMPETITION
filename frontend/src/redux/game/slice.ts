import { createSlice } from "@reduxjs/toolkit";

import reducers from "./reducer";

import { STEP_GAME_QUIZ } from "~/constants/enum";

export interface GameStateType {
  currentStep: STEP_GAME_QUIZ;
  auth: {
    sessionId: number;
  };
}

export const initialState: GameStateType = {
  currentStep: STEP_GAME_QUIZ.ONE,
  auth: {
    sessionId: 0,
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers,
});

export const { setCurrentStepGame } = gameSlice.actions;

export default gameSlice.reducer;
