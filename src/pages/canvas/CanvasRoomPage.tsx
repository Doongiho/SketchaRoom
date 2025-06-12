import * as fabric from "fabric"
import { useEffect, useRef } from "react"
import styled from "styled-components"

const CanvasRoomPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)

  const resizeCanvas = () => {
    const canvasEl = canvasRef.current
    const wrapper = document.getElementById("canvas-wrapper")

    if (!canvasEl || !wrapper) return

    const { clientWidth, clientHeight } = wrapper
    canvasEl.width = clientWidth
    canvasEl.height = clientHeight

    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.setWidth(clientWidth)
      canvas.setHeight(clientHeight)
      canvas.renderAll()
    }
  }

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
    })
    fabricCanvasRef.current = canvas

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  return (
    <Wrapper>
      <CanvasWrapper id="canvas-wrapper">
        <Canvas id="canvas" ref={canvasRef} />
      </CanvasWrapper>

      <Toolbar>
        <Section>
          <Title>그리기</Title>
          <ToolRow>
            <Button>A</Button>
            <Button>✏️</Button>
            <Button>🧽</Button>
          </ToolRow>
        </Section>

        <Section>
          <Title>도형</Title>
          <ToolRow>
            <Button>▭</Button>
            <Button>●</Button>
            <Button>▲</Button>
            <Button>◆</Button>
          </ToolRow>
        </Section>

        <Section>
          <Title>색상</Title>
          <Button>🎨</Button>
        </Section>

        <Section>
          <Button>이미지추가</Button>
          <Button>나가기</Button>
        </Section>
      </Toolbar>
    </Wrapper>
  )
}

export default CanvasRoomPage

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`

const CanvasWrapper = styled.div`
  flex: 1;
  background: #fff;
  position: relative;
`

const Toolbar = styled.div`
  width: 180px;
  border-left: 1px solid #000;
  padding: 1rem;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`

const ToolRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`
const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
`

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`
