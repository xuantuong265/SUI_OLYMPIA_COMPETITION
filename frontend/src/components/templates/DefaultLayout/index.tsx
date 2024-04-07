import { Outlet } from "react-router-dom";

import useLogin from "~/hooks/gameQuiz/useLogin";

function DefaultLayout() {
  const { handleLogin } = useLogin();

  return (
    <div>
      <div className="snowflakes">
        <div className="snowflake">❅</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">
          <img
            alt=""
            loading="lazy"
            width="85"
            height="93"
            decoding="async"
            className="w-full h-full"
            src="https://quests.mystenlabs.com/_next/static/media/snowflake-shiny.109c5cd0.svg"
          ></img>
        </div>
        <div className="snowflake">❄</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❄</div>
        <div className="snowflake">
          <img
            alt=""
            loading="lazy"
            width="85"
            height="93"
            decoding="async"
            className="w-full h-full"
            src="https://quests.mystenlabs.com/_next/static/media/snowflake-shiny.109c5cd0.svg"
          ></img>
        </div>
        <div className="snowflake">❅</div>
      </div>
      <nav className="psticky top-0 bg-white flex items-center justify-between py-3 px-4 md:px-72 z-10 shadow-notification border-bottom relative z-40">
        <div>
          <a href="#" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Olympia
            </span>
          </a>
        </div>
        <button
          onClick={handleLogin}
          className="rounded-3xl bg-black text-lg font-medium whitespace-nowrap text-white px-5 py-2"
        >
          Connect Wallet
        </button>
      </nav>

      <section className="bg-white h-screen">
        <div className="sm:px-4 md:px-10 lg:px-20 lg:py-10 md:py-10 sm:py-10 font-sans">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default DefaultLayout;
