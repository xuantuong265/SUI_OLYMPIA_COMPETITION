export type IRoom = {
  roomId: number;
  userCount: number;
  isStarted: boolean;
};

export type IRoomsResponse = {
  tpe: number;
  data: {
    onlineCount: number;
    rooms: IRoom[];
  };
};
