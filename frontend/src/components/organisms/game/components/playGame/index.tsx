import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentStepGame } from "~/redux/game/slice";
import useRoom from "~/hooks/gameQuiz/useRoom";

function PlayGame() {
  const dispatch = useDispatch();

  const answers: string[] = ["Mario Lemieux ", "Sidney Crosby", "Gordie Howe"];
  const question: string = "Which player holds the NHL record of 2,857 points?";

  useRoom();

  useEffect(() => {
    window.addEventListener("load", () => {
      let birthday: string = "2022,01,01";
      let x: NodeJS.Timeout;

      (function () {
        const second: number = 1000;
        const minute: number = second * 60;
        const hour: number = minute * 60;
        const day: number = hour * 24;

        const countDown: number = new Date(birthday).getTime();
        x = setInterval(function () {
          const now: number = new Date().getTime();
          const distance: number = countDown - now;

          const daysElement: HTMLElement | null =
            document.getElementById("days");
          if (daysElement) {
            daysElement.innerText = setNumber(distance / day);
          }

          const hoursElement: HTMLElement | null =
            document.getElementById("hours");
          if (hoursElement) {
            hoursElement.innerText = setNumber((distance % day) / hour);
          }

          const minutesElement: HTMLElement | null =
            document.getElementById("minutes");
          if (minutesElement) {
            minutesElement.innerText = setNumber((distance % hour) / minute);
          }

          // Rest of your code...

          // do something later when date is reached
          if (distance < 0) {
            let headline = document.getElementById("headline"),
              countdown = document.getElementById("countdown"),
              content = document.getElementById("content");

            if (headline) {
              headline.innerText = "It's my birthday!";
            }
            if (countdown) {
              countdown.style.display = "none";
            }
            if (content) {
              content.style.display = "block";
            }

            clearInterval(x);
          }
        }, 1000);
      })();

      function animateFlip(element: HTMLElement, value: number) {
        // Rest of your code...
      }

      function setNumber(num: number): string {
        const res: number = Math.floor(num);
        return res >= 10 ? res.toString() : `0${res}`;
      }
    });
  }, []);

  return (
    <div className="p-2 md:p-6 w-full max-w-7xl mx-auto bg-[#EBFCFF] border-black border-2 rounded-[10px] sm:bg-character-secondary-bullshark bg-brand-cloud">
      <p className="text-right pb-2 text-green-600">Number:</p>
      <div className="flex items-center">
        <div className="w-[300px]">
          <div className="flex items-center mr-7 flex-col flex-nowrap">
            <span className="seconds time-elem mb-6 text-center" id="seconds">
              <span className="top">00</span>
              <span className="top-back">
                <span>00</span>
              </span>
              <span className="bottom">00</span>
              <span className="bottom-back">
                <span>00</span>
              </span>
            </span>
          </div>
        </div>
        <div className="mt-3 flex-1">
          <p
            className="text-center font-medium text-2xl lg:text-3xl leading-loose"
            dangerouslySetInnerHTML={{ __html: question }}
          />
          <div className="grid grid-cols-1 my-5 space-y-2 place-content-center">
            {answers.map((answer, index) => {
              return (
                <button
                  onClick={() => {}}
                  key={index}
                  className="bg-blue-500 w-4/5 rounded-lg mx-auto text-white p-2 hover:bg-blue-400```tsx
                  "
                  dangerouslySetInnerHTML={{
                    __html: answer,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayGame;
