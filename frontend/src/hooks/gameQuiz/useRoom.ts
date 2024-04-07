import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";

import { STEP_GAME_QUIZ, TYPE_MESSAGE } from "~/constants/enum";
import { playersOfRoomSelector, roomsSelector } from "~/redux/game/selector";
import {
  setCurrentStepGame,
  setPlayersOfRoom,
  setQuestionOfRound,
} from "~/redux/game/slice";
import { WebsocketContext } from "~/SocketContext";
import { LoginStorage } from "~/utils/localstorage";
import { useAppDispatch, useAppSelector } from "~/utils/reduxHepper";

function useRoom() {
  const { currentSocket } = useContext(WebsocketContext);

  const dispatch = useAppDispatch();

  const playersOfRoom = useAppSelector(playersOfRoomSelector);
  const rooms = useAppSelector(roomsSelector);

  const [isReady, setIsReady] = useState<boolean>(false);

  const roomName = rooms.data?.map((room) =>
    room.id === playersOfRoom.roomId ? room.name : ""
  );
  const sessionId = LoginStorage.getData()?.sessionId || 0;

  console.log(sessionId);

  useEffect(() => {
    currentSocket.onmessage = (e) => {
      const { tpe, data } = JSON.parse(e.data);

      if (tpe === TYPE_MESSAGE.JOIN_ROOM && !isEmpty(data)) {
        dispatch(setPlayersOfRoom(data));
      }

      if (tpe === TYPE_MESSAGE.READY_GAME && !isEmpty(data)) {
        console.log(data);

        setIsReady(data.isReady);
      }

      if (tpe === TYPE_MESSAGE.PLAY_GAME && !isEmpty(data)) {
        dispatch(setQuestionOfRound(data));
      }
    };
  }, [currentSocket]);

  function handleReadyGame() {
    currentSocket.send(
      JSON.stringify({
        tpe: TYPE_MESSAGE.READY_GAME,
        sessionId,
        roomId: playersOfRoom.roomId,
      })
    );

    console.log({
      tpe: TYPE_MESSAGE.READY_GAME,
      sessionId,
      roomId: playersOfRoom.roomId,
    });
  }

  function handleBackStep() {
    dispatch(setCurrentStepGame(STEP_GAME_QUIZ.LOBBY));
  }

  return {
    roomName,
    players: playersOfRoom.players,
    isReady,
    handleReadyGame,
    handleBackStep,
  };
}

export default useRoom;
