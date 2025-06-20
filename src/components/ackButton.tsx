import { HiArrowLeft } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

interface BackButtonProps {
  to?: string
}

const BackButton = ({ to }: BackButtonProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate("/homepage")
    }
  }

  return (
    <Back onClick={handleClick}>
      <HiArrowLeft size={20} />
    </Back>
  )
}

export default BackButton

const Back = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #333;
  margin-bottom: 1rem;
  padding: 4px;
  margin: auto 0;
  
  &:hover {
    color: #000;
  }
`
