import { Box } from "@mui/material"
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"
import styled from "styled-components"

interface InviteModalProps {
  roomId?: string
  onClose: () => void
}

const InviteModal = ({ roomId, onClose }: InviteModalProps) => {
  const qrRef = useRef<HTMLDivElement>(null)
  if (!roomId) return null

  const inviteUrl = `${window.location.origin}/room/${roomId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      alert("초대 링크가 복사되었습니다!")
    } catch {
      alert("복사에 실패했습니다.")
    }
  }

  const handleSaveQR = () => {
    const svg = qrRef.current?.querySelector("svg")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)

        const pngUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = pngUrl
        link.download = `invite_${roomId}.png`
        link.click()
      }

      img.src = url
    }
  }

  return (
    <ContentWrapper>
      <ModalContent>
        <Title>친구 초대</Title>
        <QRCodeWrapper ref={qrRef}>
          <Box display="flex" justifyContent="center">
            <QRCodeSVG value={inviteUrl} size={200} />
          </Box>
        </QRCodeWrapper>
        <ButtonRow>
          <ActionBtn onClick={handleCopyLink}>링크 복사</ActionBtn>
          <ActionBtn onClick={handleSaveQR}>QR 저장</ActionBtn>
        </ButtonRow>
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </ModalContent>
    </ContentWrapper>
  )
}

export default InviteModal

const ContentWrapper = styled.div`
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

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  width: 320px;
`

const Title = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
`

const QRCodeWrapper = styled.div`
  margin-bottom: 1.5rem;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 1.2rem;
`

const ActionBtn = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`

const CloseBtn = styled.button`
  margin-top: 1rem;
  background: transparent;
  border: none;
  color: #999;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    color: #333;
  }
`
