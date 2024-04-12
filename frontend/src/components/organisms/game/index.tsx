import { useEffect } from "react";

import EndGame from "./components/endGame";
import Lobby from "./components/lobby";
import PlayGame from "./components/playGame";
import Room from "./components/room";

import { STEP_GAME_QUIZ } from "~/constants/enum";
import { currentStepSelector } from "~/redux/game/selector";
import history from "~/utils/history";
import { LoginStorage } from "~/utils/localstorage";
import { useAppSelector } from "~/utils/reduxHepper";

function Game() {
  const currentStep = useAppSelector(currentStepSelector);

  const sessionId = LoginStorage.getData()?.sessionId;

  useEffect(() => {
    if (sessionId) return;

    history.push("/");
  }, [sessionId]);

  const renderStep = () => {
    switch (currentStep) {
      case STEP_GAME_QUIZ.ROOM:
        return <Room />;
      case STEP_GAME_QUIZ.PLAY_GAME_GAME:
        return <PlayGame />;
      case STEP_GAME_QUIZ.END_GAME:
        return <EndGame />;
      default:
        return <Lobby />;
    }
  };

  return <div>{renderStep()}</div>;
}

export default Game;
