import useRoom from "~/hooks/gameQuiz/useRoom";

const Room = () => {
  const { players, roomName, isReady, handleReadyGame, handleBackStep } =
    useRoom();

  console.log({ isReady });

  return (
    <div className="w-[400px] flex flex-col justify-center items-center mx-auto">
      <p className="w-full size-5 font-bold text-center mb-6">{roomName}</p>
      <button
        onClick={handleReadyGame}
        className="w-full flex justify-center items-center h-[40px] bg-gray-100 rounded-2xl font-semibold size-4 text-black mb-2"
      >
        {isReady ? "Cancel" : "Ready"}
      </button>
      <button
        onClick={handleBackStep}
        className="w-full flex justify-center items-center h-[40px] bg-gray-100 rounded-2xl font-semibold size-4 text-black mb-4"
      >
        Back Lobby
      </button>
      <div className="w-full flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-700">Players:</span>
        <span className="text-gray-700">{players.length || 0}</span>
      </div>
      <div className="w-full flex flex-col gap-2">
        {players.map((player, index) => {
          return (
            <div
              key={index}
              className="flex bg-gray-100 justify-between rounded-md overflow-hidden"
            >
              <div className="flex items-center pointer-events-none select-none">
                <div className="w-10 h-10 m-2 rounded-md border-blue-700 bg-gray-300"></div>
                <div className="flex flex-col m-1 ">
                  <p className="font-bold text-gray-700 leading-5">
                    {player.userId}
                  </p>
                  <small className="text-gray-500">
                    {player.isReady ? "Readied" : "Waiting"}
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Room;
