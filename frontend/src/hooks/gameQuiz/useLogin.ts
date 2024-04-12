import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { TYPE_MESSAGE } from "~/constants/enum";
import { setCurrentUserId } from "~/redux/auth/slice";
import { setCurrentRoomsGame } from "~/redux/game/slice";
import { WebsocketContext } from "~/SocketContext";
import history from "~/utils/history";
import { LoginStorage } from "~/utils/localstorage";
import { useAppDispatch } from "~/utils/reduxHepper";

function useLogin() {
  const { currentSocket, connectWebSocket } = useContext(WebsocketContext);

  const dispatch = useAppDispatch();

  const handleLogin = () => {
    connectWebSocket();
  };

  useEffect(() => {
    if (currentSocket) {
      currentSocket.onopen = () => {
        const userId = uuidv4();
        currentSocket.send(`LOGIN-${userId}`);
        dispatch(setCurrentUserId(userId));
      };
    }
  }, [currentSocket]);

  useEffect(() => {
    if (!currentSocket) return;

    currentSocket.onmessage = (e) => {
      const { tpe, data } = JSON.parse(e.data);

      if (tpe === TYPE_MESSAGE.LOGIN) {
        LoginStorage.setData(data);
      }

      if (tpe === TYPE_MESSAGE.LOBBY) {
        dispatch(
          setCurrentRoomsGame({
            userCount: data.userCount,
            data: data.rooms,
          })
        );
        history.push("/game");
      }
    };
  }, [currentSocket]);

  return {
    handleLogin,
  };
}

export default useLogin;
