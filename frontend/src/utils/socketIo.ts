import { io } from "socket.io-client";

import { LoginStorage } from "./localstorage";

const { accessToken } = LoginStorage.getData() || {};

const useSocketIo = () => {
  const socket = io("", {
    auth: {
      token: `Bearer ${accessToken}`,
    },
    transports: ["websocket"],
  });
  socket.connect();
  return socket;
};

export default useSocketIo;
