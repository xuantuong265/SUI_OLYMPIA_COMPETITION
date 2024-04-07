import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import "./index.scss";
import { BrowserRouter } from "./BrowserRouter";
import { store } from "./store";
import history from "./utils/history";
import "tailwindcss/tailwind.css";
// eslint-disable-next-line import/order
import { WebsocketProvider } from "./SocketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter history={history}>
      <WebsocketProvider>
        <App />
      </WebsocketProvider>
    </BrowserRouter>
  </Provider>
  // </React.StrictMode>
);
