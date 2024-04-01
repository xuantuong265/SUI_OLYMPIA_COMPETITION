import type { PayloadAction } from "@reduxjs/toolkit";

import type { GameStateType } from "./slice";

import type { STEP_GAME_QUIZ } from "~/constants/enum";
import type {
  IPlayerOfRoom,
  IQuestionOfRound,
  IRoomsResponse,
} from "~/types/room";

export default {
  setCurrentStepGame(
    state: GameStateType,
    action: PayloadAction<STEP_GAME_QUIZ>
  ) {
    state.currentStep = action.payload;
  },

  setCurrentRoomsGame(
    state: GameStateType,
    action: PayloadAction<IRoomsResponse>
  ) {
    state.rooms = action.payload;
  },

  setPlayersOfRoom(state: GameStateType, action: PayloadAction<IPlayerOfRoom>) {
    state.playersOfRoom = action.payload;
  },

  setQuestionOfRound(
    state: GameStateType,
    action: PayloadAction<IQuestionOfRound>
  ) {
    state.questionOfRound = action.payload;
  },
};
