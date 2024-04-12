import ResultGameModal from "~/components/molecules/ResultGameModal";
import usePlayGame from "~/hooks/gameQuiz/usePlayGame";

function PlayGame() {
  const {
    answers,
    question,
    roundNumber,
    countDownRound,
    correctAnswer,
    isDisabled,
    isShowModal,
    isWinnerRound,
    winner,
    countDownWinnerRound,
    handleReplyQuestion,
  } = usePlayGame();

  return (
    <>
      <div className="p-2 md:p-6 w-full max-w-7xl mx-auto bg-[#EBFCFF] border-black border-2 rounded-[10px] sm:bg-character-secondary-bullshark bg-brand-cloud">
        <p className="text-right pb-2 text-green-600">Number: {roundNumber}</p>
        <div className="flex items-center">
          <div className="w-[300px]">
            <div className="flex items-center mr-7 flex-col flex-nowrap">
              <span className="seconds time-elem mb-6 text-center" id="seconds">
                <span className="top">{countDownRound}</span>
                <span className="top-back">
                  <span>{countDownRound}</span>
                </span>
                <span className="bottom">{countDownRound}</span>
                <span className="bottom-back">
                  <span>{countDownRound}</span>
                </span>
              </span>
            </div>
          </div>
          <div className="mt-3 flex-1">
            <p className="w-full size-5 font-bold mb-6">{question}</p>
            <ul className="flex flex-col gap-2">
              {Object.entries(answers).map(([key, answer], index) => {
                return (
                  <li className="flex items-center gap-2" key={index}>
                    <input
                      value={index + 1}
                      type="radio"
                      name="answer"
                      id="a"
                      disabled={isDisabled}
                      onChange={(e) => {
                        handleReplyQuestion(Number(e.target.value));
                      }}
                      className="cursor-pointer"
                    />
                    <label htmlFor="a">
                      {key}. {answer}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      {isShowModal && (
        <ResultGameModal
          correctAnswer={correctAnswer}
          count={countDownWinnerRound}
          isUserWinner={isWinnerRound}
          winner={winner}
        />
      )}
    </>
  );
}

export default PlayGame;
