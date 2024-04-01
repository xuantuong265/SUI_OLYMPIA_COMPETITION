import { io } from "socket.io-client";

const useSocketIo = () => {
  const socket = io("ws://0220-34-174-1-75.ngrok-free.app/game", {
    transports: ["websocket"],
  });
  console.log({ socket });

  socket.connect();
  return socket;
};

export default useSocketIo;
