import { useEffect } from "react";

import { questionOfRoundSelector } from "~/redux/game/selector";
import { useAppSelector } from "~/utils/reduxHepper";

function usePlayGame() {
  const questionOfRound = useAppSelector(questionOfRoundSelector);

  useEffect(() => {}, []);

  console.log("questionOfRound", questionOfRound);

  return {
    questionOfRound,
  };
}

export default usePlayGame;
