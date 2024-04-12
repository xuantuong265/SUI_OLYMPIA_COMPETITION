import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";

import { TYPE_MESSAGE } from "~/constants/enum";
import { currentUserIdSelector } from "~/redux/auth/selector";
import {
  playersOfRoomSelector,
  questionOfRoundSelector,
} from "~/redux/game/selector";
import { setQuestionOfRound } from "~/redux/game/slice";
import { WebsocketContext } from "~/SocketContext";
import { LoginStorage } from "~/utils/localstorage";
import { useAppDispatch, useAppSelector } from "~/utils/reduxHepper";

type IWinnerRound = {
  winner: string;
  answer: number;
};

function usePlayGame() {
  const { currentSocket } = useContext(WebsocketContext);

  const dispatch = useAppDispatch();

  const { answers, question, roundNumber } = useAppSelector(
    questionOfRoundSelector
  );
  const playersOfRoom = useAppSelector(playersOfRoomSelector);
  const currentUserId = useAppSelector(currentUserIdSelector);

  const [countDownRound, setCountDownRound] = useState<number>(15);
  const [countDownWinnerRound, setCountDownWinnerRound] = useState<number>(10);
  const [round, setRound] = useState<number>(1);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isWinnerRound, setIsWinnerRound] = useState<boolean>(false);
  const [winnerRound, setWinnerRound] = useState<IWinnerRound>(
    {} as IWinnerRound
  );

  const sessionId = LoginStorage.getData()?.sessionId || 0;

  function handleReplyQuestion(answer: number) {
    currentSocket?.send(
      JSON.stringify({
        tpe: TYPE_MESSAGE.REPLY_QUESTION,
        sessionId,
        roomId: playersOfRoom.roomId,
        data: {
          answer,
        },
      })
    );
    setIsDisabled(true);
  }

  function handleStartCountDownRoundGame() {
    let countDown = 15;
    const countdownInterval = setInterval(function () {
      setCountDownRound((prevCount) => prevCount - 1);
      countDown = countDown - 1;

      if (countDown <= 0) {
        setCountDownRound(0);
        if (round === 3) {
          setCountDownWinnerRound(0);
        } else {
          handleStartCountDownWinnerRound();
        }
        clearInterval(countdownInterval);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }

  function handleStartCountDownWinnerRound() {
    let countDown = 10;
    const countdownInterval = setInterval(() => {
      setCountDownWinnerRound((prevCount) => prevCount - 1);
      countDown = countDown - 1;

      if (countDown <= 0) {
        setIsShowModal(false);
        setCountDownWinnerRound(10);
        clearInterval(countdownInterval);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }

  function compareCorrectAnswer(
    answers: Record<string, string>,
    answer: number
  ) {
    const answerKeys = ["a", "b", "c", "d"];
    const index = answer - 1;

    if (answerKeys[index] in answers) {
      return answerKeys[index] + "." + answers[answerKeys[index]];
    }
  }

  useEffect(() => {
    if (!currentSocket) return;

    currentSocket.onmessage = (e) => {
      const { tpe, data } = JSON.parse(e.data);

      if (tpe === TYPE_MESSAGE.PLAY_GAME && !isEmpty(data)) {
        const {
          roundNumber,
          question: { q, ...answers },
        } = data;

        setRound((prevRound) => prevRound + 1);
        setCountDownRound(15);
        setIsDisabled(false);
        dispatch(
          setQuestionOfRound({
            roundNumber,
            answers,
            question: q,
          })
        );
      }

      if (tpe === TYPE_MESSAGE.WINNER_ROUND) {
        setIsShowModal(true);
        setIsWinnerRound(true);
        setWinnerRound(data);
        if (currentUserId === data.winner) {
          setIsWinnerRound(true);
        }
      }
    };
  }, [currentSocket]);

  useEffect(() => {
    handleStartCountDownRoundGame();
  }, [round]);

  return {
    question,
    answers,
    roundNumber,
    countDownRound,
    isDisabled,
    isShowModal,
    isWinnerRound,
    winner: winnerRound.winner,
    correctAnswer: compareCorrectAnswer(answers, winnerRound.answer),
    countDownWinnerRound,
    handleReplyQuestion,
  };
}

export default usePlayGame;
