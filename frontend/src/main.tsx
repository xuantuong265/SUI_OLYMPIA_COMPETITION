import ReactDOM from "react-dom/client";

import App from "./App";
import { BrowserRouter } from "./BrowserRouter";
import history from "./utils/history";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <BrowserRouter history={history}>
    <App />
  </BrowserRouter>
  // </React.StrictMode>
);
