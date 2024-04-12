import CreateRoomModal from "~/components/molecules/CreateRoomModal";
import useLobby from "~/hooks/gameQuiz/useLobby";

function Lobby() {
  const {
    rooms,
    userCount,
    isShowModal,
    handleCloseModalCreateRoom,
    handleShowModalCreateRoom,
    handleCreateRoom,
    setKeyword,
    handleJoinRoom,
  } = useLobby();

  return (
    <div>
      <div className="p-2 md:p-6 w-full max-w-7xl mx-auto bg-[#EBFCFF] border-black border-2 rounded-[10px] sm:bg-character-secondary-bullshark bg-brand-cloud">
        <div className="space-y-4 p-4 sm:px-8 sm:py-6 lg:p-4 xl:px-8 xl:py-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Total users online: {userCount}
            </h2>
            <button
              onClick={handleShowModalCreateRoom}
              className="hover:bg-blue-400 group flex items-center rounded-md bg-blue-500 text-white text-sm font-medium pl-2 pr-3 py-2 shadow-sm"
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                className="mr-2"
                aria-hidden="true"
              >
                <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
              </svg>
              Create Room
            </button>
          </div>
          <div className="group relative">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="absolute left-3 top-1/2 -mt-2.5 text-slate-400 pointer-events-none group-focus-within:text-black"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              />
            </svg>
            <input
              className="border-black border-2 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm"
              type="text"
              aria-label="Filter room"
              placeholder="Filter room..."
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
            />
          </div>
        </div>
        <ul className="p-4 sm:px-8 sm:pt-6 sm:pb-8 lg:p-4 xl:px-8 xl:pt-6 xl:pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 text-sm leading-6">
          {(rooms || []).map((room) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <li className="flex" key={room.id}>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="w-full cursor-pointer gap-4 hover:scale-[1.03] hover:shadow-lg transition py-3 px-5 rounded-[10px] border-black border-2 leading-none bg-white"
                >
                  <dl className="grid sm:block lg:grid xl:block grid-cols-2 grid-rows-2 items-center">
                    <div>
                      <dt className="sr-only">Title</dt>
                      <dd className="group-hover:text-white font-semibold text-slate-900 text-left">
                        {room.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">Category</dt>
                      <dd className="group-hover:text-blue-200 mt-3 text-left">
                        {room.isStarted ? "Playing" : "Waiting"}
                      </dd>
                    </div>
                    <div className="col-start-2 row-start-1 row-end-3 sm:mt-4 lg:mt-0 xl:mt-4">
                      <dt className="sr-only">Users</dt>
                      <dd
                        x-for="user in project.users"
                        className="flex justify-end sm:justify-start lg:justify-end xl:justify-start -space-x-1.5"
                      >
                        {Array.from({ length: room.userCount }, (_, index) => {
                          return (
                            <img
                              key={index}
                              className="w-4 h-4 rounded-full bg-slate-100 ring-2 ring-white"
                              loading="lazy"
                              src="https://i.pinimg.com/originals/ff/a0/9a/ffa09aec412db3f54deadf1b3781de2a.png"
                            ></img>
                          );
                        })}
                      </dd>
                    </div>
                  </dl>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {isShowModal && (
        <CreateRoomModal
          handleCloseModalCreateRoom={handleCloseModalCreateRoom}
          handleCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  );
}

export default Lobby;
