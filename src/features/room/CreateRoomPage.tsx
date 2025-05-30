import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { useState } from "react"
import QRCode from "react-qr-code"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { v4 as uuidv4 } from "uuid"
import { auth, db } from "../../libs/firebase"

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState("")
  const [description, setDescription] = useState("")
  const [roomId, setRoomId] = useState("")
  const [created, setCreated] = useState(false)
  const navigate = useNavigate()

  const handleCreateRoom = async () => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      alert("로그인이 필요합니다.")
      return
    }

    if (!roomName.trim()) {
      alert("방 이름을 입력해주세요.")
      return
    }

    const id = uuidv4()
    await setDoc(doc(db, "rooms", id), {
      name: roomName,
      description: description,
      createdAt: serverTimestamp(),
      createdBy: uid,
    })

    setRoomId(id)
    setCreated(true)
    navigate(`/room/${id}`)
  }

  return (
    <Wrapper>
      <Title>방 만들기</Title>

      <Input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="방 이름"
      />

      <TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="방 설명 (선택)"
        rows={4}
      />

      <Button onClick={handleCreateRoom}>생성하기</Button>

      {created && (
        <CreatedBox>
          <p>방 링크:</p>
          <Code>{`${window.location.origin}/room/${roomId}`}</Code>
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/room/${roomId}`,
              )
            }
          >
            링크 복사하기
          </Button>
          <QRWrap>
            <QRCode
              value={`${window.location.origin}/room/${roomId}`}
              size={128}
            />
          </QRWrap>
        </CreatedBox>
      )}
    </Wrapper>
  )
}

export default CreateRoomPage

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

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1.2rem;
  resize: vertical;
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

const CreatedBox = styled.div`
  margin-top: 2rem;
  text-align: center;
`

const Code = styled.code`
  display: block;
  word-break: break-all;
  background: #f2f2f2;
  padding: 8px;
  border-radius: 8px;
  margin: 10px 0;
  color: #333;
`

const QRWrap = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`
