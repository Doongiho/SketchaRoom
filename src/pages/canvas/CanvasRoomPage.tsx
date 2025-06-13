import * as fabric from "fabric"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import BackButton from "../../components/ackButton"
import { loadCanvasState, saveCanvasState } from "../../stores/useCanvasStore"

const CanvasRoomPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { roomId } = useParams<{ roomId: string }>()
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [activeTool, setActiveTool] = useState("")
  const [selectedColor, setSelectedColor] = useState("#000000")

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    const canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: false,
      selection: true,
    })
    fabricCanvasRef.current = canvas

    const resizeCanvas = () => {
      const wrapper = document.getElementById("canvas-wrapper")
      if (!wrapper) return

      const ratio = window.devicePixelRatio || 1
      canvasEl.width = wrapper.clientWidth * ratio
      canvasEl.height = wrapper.clientHeight * ratio
      canvasEl.style.width = `${wrapper.clientWidth}px`
      canvasEl.style.height = `${wrapper.clientHeight}px`

      canvas.setWidth(wrapper.clientWidth)
      canvas.setHeight(wrapper.clientHeight)
      canvas.setZoom(ratio)
      canvas.renderAll()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    if (roomId) {
      setTimeout(() => {
        loadCanvasState(roomId, canvas)
      }, 100)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [roomId])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !roomId) return

    const deleteHandler = (
      e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
    ) => {
      if (activeTool !== "delete") return

      const pointer = e.absolutePointer ?? e.pointer
      if (!pointer) return

      const objects = canvas.getObjects()
      for (const obj of objects) {
        if (obj.containsPoint(pointer)) {
          canvas.remove(obj)
          canvas.renderAll()
          break
        }
      }
    }

    const saveHandler = () => {
      console.log("캔버스 저장 호출됨")
      saveCanvasState(roomId, canvas)
    }

    canvas.on("mouse:move", deleteHandler)
    canvas.on("object:added", saveHandler)
    canvas.on("object:modified", saveHandler)
    canvas.on("object:removed", saveHandler)

    return () => {
      canvas.off("mouse:move", deleteHandler)
      canvas.off("object:added", saveHandler)
      canvas.off("object:modified", saveHandler)
      canvas.off("object:removed", saveHandler)
    }
  }, [activeTool, roomId])

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const text = new fabric.IText("텍스트", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: selectedColor,
      editable: true,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    setActiveTool("text")
  }

  const handleDraw = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const brush = new fabric.PencilBrush(canvas)
    brush.color = selectedColor
    brush.width = 2
    canvas.freeDrawingBrush = brush
    canvas.isDrawingMode = true
    setActiveTool("draw")
  }

  const handleDeleteObject = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    setActiveTool("delete")
  }

  const handleAddRect = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 70,
      fill: "lightblue",
      selectable: true,
    })
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    setActiveTool("rect")
  }

  const handleAddCircle = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 40,
      fill: "lightgreen",
      selectable: true,
    })
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    setActiveTool("circle")
  }

  const handleAddTriangle = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      width: 80,
      height: 80,
      fill: "pink",
      selectable: true,
    })
    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll()
    setActiveTool("triangle")
  }

  const handleAddDiamond = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const diamond = new fabric.Polygon(
      [
        { x: 0, y: -50 },
        { x: 50, y: 0 },
        { x: 0, y: 50 },
        { x: -50, y: 0 },
      ],
      {
        left: 250,
        top: 250,
        fill: "violet",
        selectable: true,
        originX: "center",
        originY: "center",
      },
    )
    canvas.add(diamond)
    canvas.setActiveObject(diamond)
    canvas.renderAll()
    setActiveTool("diamond")
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setSelectedColor(newColor)

    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject && "set" in activeObject) {
      activeObject.set("fill", newColor)
      canvas.renderAll()
    }

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = newColor
    }
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = fabricCanvasRef.current
    const file = e.target.files?.[0]
    if (!canvas || !file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const fabricImg = new fabric.Image(img, {
          left: 100,
          top: 100,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
        })
        canvas.add(fabricImg)
        canvas.setActiveObject(fabricImg)
        canvas.renderAll()
        setActiveTool("image")
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <Wrapper>
      <CanvasWrapper id="canvas-wrapper">
        <Canvas id="canvas" ref={canvasRef} />
      </CanvasWrapper>
      <Toolbar>
        <Section>
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
            <Button
              onClick={handleDeleteObject}
              className={activeTool === "delete" ? "active" : ""}
            >
              🧽
            </Button>
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
              className={activeTool === "diamond" ? "active" : ""}
            >
              ◆
            </Button>
          </ToolRow>
        </Section>
        <Section>
          <Title>색상</Title>
          <ColorPicker
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
          />
        </Section>
        <Section>
          <Title>이미지</Title>
          <label htmlFor="imageUpload">
            <Button
              as="span"
              className={activeTool === "image" ? "active" : ""}
            >
              이미지 추가
            </Button>
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleAddImage}
            style={{ display: "none" }}
          />
        </Section>
      </Toolbar>
      <BackDiv>
        <BackButton />
      </BackDiv>
    </Wrapper>
  )
}

export default CanvasRoomPage

const Wrapper = styled.div`
  display: flex;
  height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const CanvasWrapper = styled.div`
  flex: 1;
  background: #fff;
  position: relative;
`

const Toolbar = styled.div`
  width: 180px;
  border-left: 1px solid #000;
  padding: 2rem;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid #ccc;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 1rem;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #f9f9f9;
    z-index: 10;
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 160px;
  box-sizing: border-box;
`

const ToolRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    width: 100%;
  }
`

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
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
  position: fixed;
  top: 10px;
  right: 10px;
  transform: translateX(-50%);
  z-index: 20;
`

const ColorPicker = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  padding: 0;
  background: none;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);

  &::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: 50%;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
`
