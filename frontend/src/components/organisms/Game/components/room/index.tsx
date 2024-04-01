function Room() {
  const answers = ["Mario Lemieux ", "Sidney Crosby", "Gordie Howe"];
  const question = "Which player holds the NHL record of 2,857 points?";

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-3 py-5 md:p-8 bg-white shadow rounded-lg max-w-[800px] w-11/12 min-h-[300px]">
        <p className="text-right pb-2 text-green-600">10</p>
        <div className="mt-3">
          <p
            className="text-center font-medium text-2xl lg:text-3xl leading-loose"
            dangerouslySetInnerHTML={{ __html: question }}
          />
          <div className="grid grid-cols-1 my-5 space-y-2 place-content-center">
            {answers.map((answer, index) => {
              return (
                <button
                  key={index}
                  className="bg-blue-500 w-4/5 rounded-lg mx-auto text-white p-2 hover:bg-blue-400"
                  dangerouslySetInnerHTML={{
                    __html: answer,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <button className="py-2 px-7 text-medium flex rounded-lg text-white bg-yellow-600 hover:bg-green-700">
            Next question
          </button>
        </div>
      </div>
    </main>
  );
}

export default Room;
