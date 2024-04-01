import type { AnyAction } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { ThunkDispatch } from "redux-thunk";

import type { RootState } from "../store";

type TypedDispatch<T> = ThunkDispatch<T, any, AnyAction>;

export const useAppDispatch = () => useDispatch<TypedDispatch<RootState>>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
