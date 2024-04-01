import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { TYPE_MESSAGE } from "~/constants/enum";
import { setCurrentRoomsGame } from "~/redux/game/slice";
import { WebsocketContext } from "~/SocketContext";
import history from "~/utils/history";
import { LoginStorage } from "~/utils/localstorage";
import { useAppDispatch } from "~/utils/reduxHepper";

function useLogin() {
  const { currentSocket } = useContext(WebsocketContext);

  const dispatch = useAppDispatch();

  const [value, setValue] = useState<string>("");

  const handleLogin = () => {
    if (currentSocket) {
      console.log("oke");

      currentSocket.send(`LOGIN-${uuidv4()}`);
    }
  };

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
    setValue,
    handleLogin,
  };
}

export default useLogin;
