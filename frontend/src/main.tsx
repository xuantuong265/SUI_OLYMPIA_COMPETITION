import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import "./index.css";
import { BrowserRouter } from "./BrowserRouter";
import { store } from "./store";
import history from "./utils/history";
import "tailwindcss/tailwind.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter history={history}>
      <App />
    </BrowserRouter>
  </Provider>
  // </React.StrictMode>
);
