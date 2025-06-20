import { useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../../libs/firebase"

const EnterRoomPage = () => {
  const [roomInput, setRoomInput] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleEnter = async () => {
    if (!roomInput.trim()) {
      setError("Room ID를 입력해주세요.")
      return
    }

    try {
      const roomId = roomInput.includes("room/")
        ? roomInput.split("room/")[1].split(/[/?#]/)[0]
        : roomInput

      if (!roomId || roomId.trim() === "") {
        setError("올바른 Room ID를 입력해주세요.")
        return
      }

      const uid = auth.currentUser?.uid
      if (uid) {
        await setDoc(
          doc(db, `users/${uid}/joinedRooms/${roomId}`),
          {
            roomId,
            joinedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      navigate(`/room/${roomId}`)
    } catch (e) {
      console.error("입장 실패:", e)
      setError("입장 중 오류가 발생했습니다.")
    }
  }

  return (
    <Wrapper>
      <Title>방 입장하기</Title>
      <Input
        type="text"
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}
        placeholder="room/abc123 또는 abc123"
      />
      {error && <ErrorText>{error}</ErrorText>}
      <Button onClick={handleEnter}>입장</Button>
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Title = styled.h3`
  text-align: center;
  font-size: 1.3rem;
`

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
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


const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
  text-align: center;
  `