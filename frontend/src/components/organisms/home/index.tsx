import logo from "~/assets/olympia.png";
import useLogin from "~/hooks/gameQuiz/useLogin";

const Home = () => {
  const { handleSubmit, setValue } = useLogin();

  const rewards = [
    {
      title: "Reward 1",
      points: "100 Olympia",
      backgroundImageUrl:
        "https://fe-assets.mystenlabs.com/quests/tangerine-reward-bg.svg",
    },
    {
      title: "Reward 2",
      points: "200 Olympia",
      backgroundImageUrl:
        "https://fe-assets.mystenlabs.com/quests/tangerine-reward-bg.svg",
    },
    {
      title: "Reward 1",
      points: "100 Olympia",
      backgroundImageUrl:
        "https://fe-assets.mystenlabs.com/quests/tangerine-reward-bg.svg",
    },
    {
      title: "Reward 2",
      points: "200 Olympia",
      backgroundImageUrl:
        "https://fe-assets.mystenlabs.com/quests/tangerine-reward-bg.svg",
    },
  ];

  return (
    <div className="p-2 md:p-6 w-full max-w-7xl mx-auto sm:bg-character-secondary-bullshark bg-brand-cloud">
      <div className="relative overflow-hidden flex flex-col border-[3px] border-black rounded-xl mb-5">
        <div className="relative">
          <img
            alt=""
            loading="lazy"
            height="632"
            decoding="async"
            data-nimg="1"
            className="relative block md:hidden w-full rounded-xl"
            style={{ color: "transparent" }}
            src="https://fe-assets.mystenlabs.com/quests/winter-bg-small.svg"
          ></img>
          <img
            alt=""
            loading="lazy"
            height="420"
            decoding="async"
            data-nimg="1"
            className="relative hidden md:block w-full rounded-xl"
            style={{ color: "transparent" }}
            src="https://fe-assets.mystenlabs.com/quests/winter-bg-no-gifts.svg"
          ></img>
        </div>
      </div>
      <div className="bg-[#EBFCFF] border-3 border-[3px] border-black rounded-xl relative p-6">
        <div className="font-frankfurter text-center text-4xl mb-8 uppercase font-semibold">
          top prizes
        </div>
        <div className="flex flex-wrap mx-auto items-center justify-start gap-y-4">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="flex flex-col justify-end p-3 rounded-xl h-[360px] w-[230px] mx-auto relative"
              style={{ backgroundImage: `url(${reward.backgroundImageUrl})` }}
            >
              <div className="flex flex-col p-2 border-3 border-black rounded-xl text-center bg-white/50">
                <span className="font-bold text-lg">{reward.title}</span>
                <span
                  className="font-frankfurter text-white text-2xl"
                  style={{ WebkitTextStroke: "2px black" }}
                >
                  {reward.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
