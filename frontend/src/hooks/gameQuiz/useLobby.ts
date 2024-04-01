import { useEffect } from "react";

function useLobby(socket: WebSocket) {
  useEffect(() => {
    socket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("got reply! ", dataFromServer);
    };
  }, []);

  return {};
}

export default useLobby;
