const useWebSocket = () => {
  const socket = new WebSocket("ws://0220-34-174-1-75.ngrok-free.app/game");

  return socket;
};

export default useWebSocket;
