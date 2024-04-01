import { createSelector } from "@reduxjs/toolkit";

import { type RootState } from "~/store";

const game = (state: RootState) => state.gameReducer;

export const currentStepSelector = createSelector(
  [game],
  (gameState) => gameState.currentStep
);

export const roomsSelector = createSelector(
  [game],
  (gameState) => gameState.rooms
);

export const playersOfRoomSelector = createSelector(
  [game],
  (gameState) => gameState.playersOfRoom
);

export const questionOfRoundSelector = createSelector(
  [game],
  (gameState) => gameState.questionOfRound
);
