import { doc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import styled from "styled-components"
import { db } from "../../libs/firebase"

interface RoomEditModalProps {
  roomId: string
  initialName: string
  initialDescription: string
  onClose: () => void
  onUpdate: () => void
}

const RoomEditModal = ({
  roomId,
  initialName,
  initialDescription,
  onClose,
  onUpdate,
}: RoomEditModalProps) => {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        name,
        description,
      })
      alert("방 정보가 수정되었습니다.")
      onUpdate()
      onClose()
    } catch (error) {
      console.error("방 수정 실패:", error)
      alert("방 정보 수정 중 오류가 발생했습니다.")
    }
  }

  return (
    <Overlay>
      <ModalBox>
        <h3>방 정보 수정</h3>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="방 이름"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="방 설명"
        />
        <ButtonGroup>
          <Button onClick={handleSave}>저장</Button>
          <Button onClick={onClose}>취소</Button>
        </ButtonGroup>
      </ModalBox>
    </Overlay>
  )
}

export default RoomEditModal

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 320px;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
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
