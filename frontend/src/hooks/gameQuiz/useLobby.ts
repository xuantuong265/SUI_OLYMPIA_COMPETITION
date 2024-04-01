import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";

import { STEP_GAME_QUIZ, TYPE_MESSAGE } from "~/constants/enum";
import { roomsSelector } from "~/redux/game/selector";
import {
  setCurrentRoomsGame,
  setCurrentStepGame,
  setPlayersOfRoom,
} from "~/redux/game/slice";
import { WebsocketContext } from "~/SocketContext";
import type { IRoom } from "~/types/room";
import { LoginStorage } from "~/utils/localstorage";
import { useAppDispatch, useAppSelector } from "~/utils/reduxHepper";

function useLobby() {
  const { currentSocket } = useContext(WebsocketContext);

  const rooms = useAppSelector(roomsSelector);
  const dispatch = useAppDispatch();

  const [roomsFilter, setRoomsFilter] = useState<IRoom[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  function filterRooms(rooms: IRoom[], keyword: string): IRoom[] {
    if (!keyword) return rooms;

    return rooms.filter((room) =>
      room.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  function handleShowModalCreateRoom() {
    setIsShowModal(true);
  }

  function handleCloseModalCreateRoom() {
    setIsShowModal(false);
  }

  function handleCreateRoom(roomName: string) {
    if (!currentSocket) return;

    setIsShowModal(false);
    currentSocket.send(
      JSON.stringify({
        tpe: TYPE_MESSAGE.CREATE_ROOM,
        sessionId: LoginStorage.getData()?.sessionId || 0,
        data: {
          roomName,
        },
      })
    );
  }

  function handleJoinRoom(roomId: number) {
    if (!currentSocket) return;

    console.log("aa");

    currentSocket.send(
      JSON.stringify({
        tpe: TYPE_MESSAGE.JOIN_ROOM,
        sessionId: LoginStorage.getData()?.sessionId || 0,
        data: {
          roomId,
        },
      })
    );
  }

  useEffect(() => {
    if (!currentSocket) return;

    currentSocket.onmessage = (event) => {
      const { tpe, data } = JSON.parse(event.data);

      console.log("hahahah");

      if (tpe === TYPE_MESSAGE.LOBBY && !isEmpty(data)) {
        dispatch(
          setCurrentRoomsGame({
            userCount: data.userCount,
            data: data.rooms,
          })
        );
      }

      console.log("data", data);

      if (tpe === TYPE_MESSAGE.JOIN_ROOM && !isEmpty(data)) {
        dispatch(setPlayersOfRoom(data));
        dispatch(setCurrentStepGame(STEP_GAME_QUIZ.ROOM));
      }
    };
  }, [currentSocket]);

  useEffect(() => {
    setRoomsFilter(filterRooms(rooms.data, keyword));
  }, [keyword]);

  useEffect(() => {
    if (!isEmpty(rooms)) {
      setRoomsFilter(rooms.data);
    }
  }, [rooms]);

  return {
    userCount: rooms.userCount,
    rooms: roomsFilter ?? [],
    isShowModal,
    setKeyword,
    handleShowModalCreateRoom,
    handleCloseModalCreateRoom,
    handleCreateRoom,
    handleJoinRoom,
  };
}

export default useLobby;
