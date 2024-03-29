import { Route, Routes } from "react-router-dom";

import DefaultLayout from "./components/templates/DefaultLayout";
import GamePage from "./pages/Game";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<GamePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
