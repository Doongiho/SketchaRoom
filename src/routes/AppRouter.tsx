import { BrowserRouter, Route, Routes } from "react-router-dom"

import LoginPage from "../pages/auth/LoginPage"
import ProfilePage from "../pages/auth/ProfilePage"
import SignUpPage from "../pages/auth/SignUpPage"
import CanvasRoomPage from "../pages/canvas/CanvasRoomPage"
import HistoryPage from "../pages/history/HistoryPage"
import HomePage from "../pages/home/HomePage"
import NotFoundPage from "../pages/notfound/NotFoundPage"
import CreateRoomPage from "../pages/room/CreateRoomPage"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/createRoom" element={<CreateRoomPage />} />
        <Route path="/room/:roomId" element={<CanvasRoomPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
