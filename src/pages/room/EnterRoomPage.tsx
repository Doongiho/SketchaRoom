import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../../libs/firebase"
import BackButton from "../../components/ackButton"

const EnterRoomPage = () => {
  const [roomId, setRoomId] = useState("")
  const navigate = useNavigate()

  const handleEnterRoom = async () => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      alert("로그인이 필요합니다.")
      return
    }

    const raw = roomId.trim()
    if (!raw) {
      alert("방 ID 또는 초대 링크를 입력해주세요.")
      return
    }

    const parsedId = raw.includes("/room/") ? raw.split("/room/")[1] : raw

    const roomRef = doc(db, "rooms", parsedId)
    const roomSnap = await getDoc(roomRef)

    if (!roomSnap.exists()) {
      alert("존재하지 않는 방입니다.")
      return
    }

    const roomData = roomSnap.data()

    const friendRef = doc(db, "users", uid, "friendRooms", parsedId)
    await setDoc(friendRef, {
      name: roomData.name || "이름 없음",
      description: roomData.description || "",
      addedAt: serverTimestamp(),
    })

    alert("친구방에 추가되었습니다.")
    navigate(`/room/${parsedId}`)
  }

  return (
    <Wrapper>
      <BackButton />
      <Title>방 입장하기</Title>
      <Input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="방 ID 또는 초대 링크"
      />
      <Button onClick={handleEnterRoom}>입장하기</Button>
    </Wrapper>
  )
}

export default EnterRoomPage

const Wrapper = styled.div`
  max-width: 480px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
`

const Title = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 2rem;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1.2rem;
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: #ffc6c6;
  color: #594100;
  border: 2px solid #594100;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #594100;
    color: #ffffff;
  }
`
