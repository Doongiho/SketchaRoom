import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from "../features/home/HomePage"
import LoginPage from "../features/auth/LoginPage"
import SignUpPage from "../features/auth/SignUpPage"
import CreateRoomPage from "../features/room/CreateRoomPage"
import CanvasRoomPage from "../features/canvas/CanvasRoomPage"
import HistoryPage from "../features/history/HistoryPage"
import NotFoundPage from "../features/notfound/NotFoundPage"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/createRoom" element={<CreateRoomPage />} />
        <Route path="/room/:roomId" element={<CanvasRoomPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
