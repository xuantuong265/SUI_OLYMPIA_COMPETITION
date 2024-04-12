import Confetti from "react-confetti";

type IResultGameModal = {
  winner: string;
  correctAnswer: number;
  isUserWinner: boolean;
  count: number;
};

const ResultGameModal = ({
  correctAnswer,
  isUserWinner,
  winner,
  count,
}: IResultGameModal) => {
  return (
    <div className="absolute top-0 left-0 h-screen w-full flex items-center bg-[rgba(0,0,0,.5)]">
      {<Confetti />}
      <div className=" text-center bg-white p-8 mx-auto rounded-lg max-w-[600px] w-11/12">
        <h4 className="text-3xl pb-3 text-center font-bold">
          {winner} is winner
        </h4>
        <p className="py-2">Correct answer {correctAnswer}</p>
        {isUserWinner && <p className="py-2 font-medium">Congrats!!!</p>}
        <p className="bg-yellow-600 py-2 px-7 rounded-xl text-white mt-2 hover:bg-yellow-500">
          Play next game {count}s
        </p>
      </div>
    </div>
  );
};

export default ResultGameModal;
