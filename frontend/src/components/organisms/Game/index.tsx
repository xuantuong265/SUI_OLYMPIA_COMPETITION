import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";

import EndGame from "./components/endGame";
import Lobby from "./components/lobby";
import Login from "./components/login";
import Room from "./components/room";

import { STEP_GAME_QUIZ } from "~/constants/enum";
import { currentStepSelector } from "~/redux/game/selector";
import { useAppSelector } from "~/utils/reduxHepper";

function Game() {
  const currentStep = useAppSelector(currentStepSelector);
  const [isConnected, setConnected] = useState<boolean>(false);

  const socket = new WebSocket("ws://0220-34-174-1-75.ngrok-free.app/game");

  useEffect(() => {
    // socket.onopen = () => {
    //   socket.send("LOGIN-123");
    // };

    socket.onmessage = (event) => {
      // const data = JSON.parse(event);

      console.log(event.data);
    };
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case STEP_GAME_QUIZ.LOBBY:
        return <Lobby socket={socket} />;
      case STEP_GAME_QUIZ.ROOM:
        return <Room />;
      case STEP_GAME_QUIZ.END_GAME:
        return <EndGame />;
      default:
        return <Login socket={socket} />;
    }
  };

  return <Box>{renderStep()}</Box>;
}

export default Game;
