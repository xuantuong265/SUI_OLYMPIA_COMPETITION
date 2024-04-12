import { createSlice } from "@reduxjs/toolkit";

import reducers from "./reducer";

import { STEP_GAME_QUIZ } from "~/constants/enum";
import type {
  IPlayer,
  IPlayerOfRoom,
  IQuestionOfRound,
  IRoom,
} from "~/types/game";

export interface GameStateType {
  currentStep: STEP_GAME_QUIZ;
  auth: {
    sessionId: number;
  };
  rooms: {
    userCount: number;
    data: IRoom[];
  };
  playersOfRoom: IPlayerOfRoom;
  questionOfRound: IQuestionOfRound;
}

export const initialState: GameStateType = {
  currentStep: STEP_GAME_QUIZ.LOBBY,
  auth: {
    sessionId: 0,
  },
  rooms: {
    userCount: 0,
    data: [],
  },
  playersOfRoom: {
    roomId: 0,
    players: [] as IPlayer[],
  },
  questionOfRound: {
    roundNumber: 1,
    question: "",
    answers: {},
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers,
});

export const {
  setCurrentStepGame,
  setCurrentRoomsGame,
  setPlayersOfRoom,
  setQuestionOfRound,
} = gameSlice.actions;

export default gameSlice.reducer;
