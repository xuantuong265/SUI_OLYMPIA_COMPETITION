import React, { createContext, useEffect, useState } from "react";

export interface WebsocketContextProps {
  currentSocket: WebSocket | null;
  connectWebSocket: () => void;
}

export const WebsocketContext = createContext<WebsocketContextProps>({
  currentSocket: null,
  connectWebSocket: () => {},
});

export const WebsocketProvider: React.FC = ({ children }: any) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  function connectWebSocket() {
    const ws = new WebSocket("ws:///0046-34-174-1-75.ngrok-free.app/game");
    setSocket(ws);
  }

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const contextValue: WebsocketContextProps = {
    currentSocket: socket,
    connectWebSocket,
  };

  return (
    <WebsocketContext.Provider value={contextValue}>
      {children}
    </WebsocketContext.Provider>
  );
};
