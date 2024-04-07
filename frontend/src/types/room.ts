export type IRoom = {
  id: number;
  name: string;
  usersCount: number;
  isStarted: boolean;
};

export type IRoomsResponse = {
  userCount: number;
  data: IRoom[];
};

export type IPlayer = {
  userId: string;
  isReady: boolean;
};

export type IPlayerOfRoom = {
  roomId: number;
  players: IPlayer[];
};

export type IQuestionOfRound = {
  roundNumber: number;
  question: object;
};
