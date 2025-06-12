import * as fabric from "fabric"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import BackButton from "../../components/ackButton"

const CanvasRoomPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [activeTool, setActiveTool] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("#000000")

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
      isDrawingMode: false,
      selection: true,
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

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.isDrawingMode = false
      const text = new fabric.IText("텍스트", {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: "#000",
        editable: true,
        selectable: true,
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      setActiveTool("text")
    }
  }

  const handleDraw = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      const brush = new fabric.PencilBrush(canvas)
      brush.color = "blue"
      brush.width = 2
      canvas.freeDrawingBrush = brush
      canvas.isDrawingMode = true
      setActiveTool("draw")
    }
  }

  const handleAddRect = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.isDrawingMode = false
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'lightblue',
        width: 100,
        height: 70,
        selectable: true,
      })
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
      setActiveTool("rect")
    }
  }

  const handleAddCircle = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.isDrawingMode = false
      const circle = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 40,
        fill: 'lightgreen',
        selectable: true,
      })
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
      setActiveTool("circle")
    }
  }

  const handleAddTriangle = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.isDrawingMode = false
      const triangle = new fabric.Triangle({
        left: 200,
        top: 200,
        width: 80,
        height: 80,
        fill: 'pink',
        selectable: true,
      })
      canvas.add(triangle)
      canvas.setActiveObject(triangle)
      canvas.renderAll()
      setActiveTool("triangle")
    }
  }

  const handleAddDiamond = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.isDrawingMode = false
      const diamond = new fabric.Polygon([
        { x: 0, y: -50 },
        { x: 50, y: 0 },
        { x: 0, y: 50 },
        { x: -50, y: 0 },
      ], {
        left: 250,
        top: 250,
        fill: 'violet',
        selectable: true,
        originX: 'center',
        originY: 'center',
      })
      canvas.add(diamond)
      canvas.setActiveObject(diamond)
      canvas.renderAll()
      setActiveTool("diamond")
    }
  }

  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value)

    const canvas = fabricCanvasRef.current
    const activeObject = canvas?.getActiveObject()

    if (canvas && activeObject && 'set' in activeObject) {
      activeObject.set("fill", e.target.value)
      canvas.renderAll()
    }
  }

  return (
    <Wrapper>
      <CanvasWrapper id="canvas-wrapper">
        <Canvas id="canvas" ref={canvasRef} />
      </CanvasWrapper>

      <Toolbar>
        <Section>
          <BackDiv>
            <BackButton />
          </BackDiv>
          <Title>그리기</Title>
          <ToolRow>
            <Button
              onClick={handleAddText}
              className={activeTool === "text" ? "active" : ""}
            >
              A
            </Button>
            <Button
              onClick={handleDraw}
              className={activeTool === "draw" ? "active" : ""}
            >
              ✏️
            </Button>
            <Button disabled>🧽</Button>
          </ToolRow>
        </Section>
        <Section>
          <Title>도형</Title>
          <ToolRow>
            <Button
              onClick={handleAddRect}
              className={activeTool === "rect" ? "active" : ""}
            >
              ▭
            </Button>
            <Button
              onClick={handleAddCircle}
              className={activeTool === "circle" ? "active" : ""}
            >
              ●
            </Button>
            <Button
              onClick={handleAddTriangle}
              className={activeTool === "triangle" ? "active" : ""}
            >
              ▲
            </Button>
            <Button
              onClick={handleAddDiamond}
              className={activeTool === "triangle" ? "active" : ""}
            >◆</Button>
          </ToolRow>
        </Section>
        <Section>
          <Title>색상</Title>
          <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            style={{ width: "100%", height: "40px", border: "none", background: "none", cursor: "pointer" }}
          />
        </Section>
        <Section>
          <Button disabled>이미지추가</Button>
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
  &.active {
    background-color: #d0e8ff;
    border-color: #3399ff;
  }
`

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`

const BackDiv = styled.div`
    display: flex;
    justify-content: end;
    width:100%;  
`
