import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import MemberRouter from "./MemberRouter";
import HomeRouter from "./HomeRouter";
import SocialRouter from "./SocialRouter";
import MyBookRouter from "./MyBookRouter";
import ForumRouter from "./ForumRouter";
import SettingsRouter from "./SettingsRouter";
import MainPage from "../pages/MainPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/member/*" element={<MemberRouter />} />
        <Route path="/home/*" element={<HomeRouter />} />
        <Route path="/social/*" element={<SocialRouter />} />
        <Route path="/myBook/*" element={<MyBookRouter />} />
        <Route path="/forum/*" element={<ForumRouter />} />
        <Route path="/settings/*" element={<SettingsRouter />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;