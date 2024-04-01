import React, { createContext, useEffect, useRef } from "react";

export interface WebsocketContextProps {
  currentSocket: WebSocket;
}

export const WebsocketContext = createContext<WebsocketContextProps>({
  currentSocket: null,
});

export const WebsocketProvider: React.FC = ({ children }: any) => {
  const socket = new WebSocket("ws:///0046-34-174-1-75.ngrok-free.app/game");

  useEffect(() => {
    return () => {
      socket.close();
    };
  }, [socket]);

  const contextValue: WebsocketContextProps = {
    currentSocket: socket,
  };

  return (
    <WebsocketContext.Provider value={contextValue}>
      {children}
    </WebsocketContext.Provider>
  );
};
