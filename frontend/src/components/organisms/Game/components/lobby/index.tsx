import useLobby from "~/hooks/gameQuiz/useLobby";

type ILobby = {
  socket: WebSocket;
};

function Lobby({ socket }: ILobby) {
  useLobby(socket);

  return <>Lobby</>;
}

export default Lobby;
