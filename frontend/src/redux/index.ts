import type { Reducer } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";

import authReducer, { type AuthStateType } from "./auth/slice";
import gameReducer, { type GameStateType } from "./game/slice";

export interface IRootReducer {
  readonly authReducer: Reducer<AuthStateType>;
  readonly gameReducer: Reducer<GameStateType>;
}

const rootReducer = combineReducers<IRootReducer>({
  authReducer,
  gameReducer,
});

export default rootReducer;
