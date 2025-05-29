import { BrowserRouter, Route, Routes } from "react-router-dom"

import LoginPage from "../features/auth/LoginPage"
import ProfilePage from "../features/auth/ProfilePage"
import SignUpPage from "../features/auth/SignUpPage"
import CanvasRoomPage from "../features/canvas/CanvasRoomPage"
import HistoryPage from "../features/history/HistoryPage"
import HomePage from "../features/home/HomePage"
import NotFoundPage from "../features/notfound/NotFoundPage"
import CreateRoomPage from "../features/room/CreateRoomPage"

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
