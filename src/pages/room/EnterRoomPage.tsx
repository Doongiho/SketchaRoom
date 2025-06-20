import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import BackButton from "../../components/ackButton"

const EnterRoomPage = () => {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleEnterRoom = () => {
    if (!input.trim()) {
      setError("Room ID 또는 링크를 입력해주세요.")
      return
    }

    try {
      const roomId = input.includes("room/")
        ? input.split("room/")[1].split(/[/?#]/)[0]
        : input

      if (!roomId || roomId.trim() === "") {
        setError("올바른 Room ID를 입력해주세요.")
        return
      }

      navigate(`/room/${roomId}`)
    } catch {
      setError("입력값이 올바르지 않습니다.")
    }
  }

  return (
    <Wrapper>
      <BackButton />
      <Title>방 입장하기</Title>

      <Input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setError("")
        }}
        placeholder="Room ID 또는 링크를 입력하세요"
      />

      {error && <ErrorText>{error}</ErrorText>}

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
  margin-bottom: 1rem;
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
  margin-top: -0.5rem;
`
