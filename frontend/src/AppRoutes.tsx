import { Route, Routes } from "react-router-dom";

import DefaultLayout from "./components/templates/DefaultLayout";
import GamePage from "./pages/game";
import HomePage from "./pages/home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
