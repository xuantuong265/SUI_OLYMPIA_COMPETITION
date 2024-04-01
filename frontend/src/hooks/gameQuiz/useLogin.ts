import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { STEP_GAME_QUIZ } from "~/constants/enum";
import { setCurrentStepGame } from "~/redux/game/slice";
import { useAppDispatch } from "~/utils/reduxHepper";

function useLogin(socket: WebSocket) {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState<string>("");

  const handleSubmit = () => {
    console.log("du");

    socket.send(`LOGIN-${value}`);
    dispatch(setCurrentStepGame(STEP_GAME_QUIZ.ROOM));
  };

  return {
    setValue,
    handleSubmit,
  };
}

export default useLogin;
