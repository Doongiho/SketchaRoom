import type {
  Object as FabricObject,
  ImageProps,
  ObjectEvents,
  SerializedImageProps,
  TOptions,
  TPointerEvent,
  TPointerEventInfo,
} from "fabric"
import {
  Circle,
  Canvas as FabricCanvas,
  Image as FabricImage,
  IText,
  Path,
  PencilBrush,
  Point,
  Polygon,
  Rect,
  Triangle,
  util,
} from "fabric"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { v4 as uuidv4 } from "uuid"
import BackButton from "../../components/ackButton"
import { auth } from "../../libs/firebase"
import { loadCanvasState, saveCanvasState } from "../../stores/useCanvasStore"

function extendToObjectWithId<T extends FabricObject>(klass: { prototype: T }) {
  const originalToObject = klass.prototype.toObject

  klass.prototype.toObject = function (
    this: T,
    propertiesToInclude?: (keyof T)[],
  ): Record<string, unknown> {
    const base = originalToObject.call(this, propertiesToInclude)
    return {
      ...base,
      id: (this as unknown as { id?: string }).id,
      ...(this instanceof FabricImage && typeof this.getSrc === "function"
        ? { src: this.getSrc() }
        : {}),
    }
  }
}

extendToObjectWithId(Path)
extendToObjectWithId(Rect)
extendToObjectWithId(Circle)
extendToObjectWithId(Triangle)
extendToObjectWithId(Polygon)
extendToObjectWithId(IText)
extendToObjectWithId(FabricImage)

const CanvasRoomPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { roomId } = useParams<{ roomId: string }>()
  const fabricCanvasRef = useRef<FabricCanvas | null>(null)
  const [activeTool, setActiveTool] = useState("")
  const [selectedColor, setSelectedColor] = useState("#000000")
  const socketRef = useRef<WebSocket | null>(null)
  const [userList, setUserList] = useState<string[]>([])

  useEffect(() => {
    if (!roomId) return

    const FabricImageTyped = FabricImage as unknown as {
      fromObjectRegistered?: boolean
      fromObject: <T extends TOptions<SerializedImageProps>>(
        obj: T,
      ) => Promise<
        FabricImage<
          Omit<T, "src" | "filters" | "resizeFilter" | "type" | "crossOrigin"> &
            Partial<ImageProps>,
          SerializedImageProps,
          ObjectEvents
        >
      >
    }

    if (!FabricImageTyped.fromObjectRegistered) {
      FabricImageTyped.fromObject = async <
        T extends TOptions<SerializedImageProps>,
      >(
        obj: T,
      ) => {
        const src = (obj as { src?: string }).src
        if (typeof src !== "string") {
          throw new Error("'src' 필드가 없거나 문자열이 아닙니다.")
        }

        const img = document.createElement("img")
        img.crossOrigin = "anonymous"
        img.src = src

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("이미지 로드 실패"))
        })

        return new FabricImage(img, obj as Partial<ImageProps>)
      }

      FabricImageTyped.fromObjectRegistered = true
    }

    const socket = new WebSocket("ws://localhost:8080")
    socketRef.current = socket

    socket.onopen = () => {
      console.log("✅ WebSocket 연결됨")
      socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          name: getDisplayName(),
        }),
      )
    }

    const enlivenObjectsAsync = <T extends object>(
      objects: T[],
    ): Promise<FabricObject[]> => {
      return util.enlivenObjects(objects)
    }

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log("💬 수신 메시지:", data)

      if (data.type === "user-list") {
        const names = data.payload as string[]
        setUserList(names)
      }

      if (data.type === "add-object" && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current

        try {
          const objects = await enlivenObjectsAsync([data.payload])

          for (const obj of objects) {
            canvas.add(obj)
          }

          canvas.requestRenderAll()
        } catch (error) {
          console.error("enlivenObjects 복원 실패:", error)
        }
      }
      if (data.type === "delete-object" && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current
        const objects = canvas.getObjects()
        const target = objects.find((obj) => obj.id === data.payload.id)
        if (target) {
          canvas.remove(target)
          canvas.requestRenderAll()
        }
      }
      if (data.type === "update-object" && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current
        const objects = canvas.getObjects()
        const target = objects.find((obj) => obj.id === data.payload.id)

        if (target && "set" in target) {
          const { left, top, angle, scaleX, scaleY, fill } = data.payload

          if (typeof left === "number") target.set("left", left)
          if (typeof top === "number") target.set("top", top)
          if (typeof angle === "number") target.set("angle", angle)
          if (typeof scaleX === "number") target.set("scaleX", scaleX)
          if (typeof scaleY === "number") target.set("scaleY", scaleY)
          if (typeof fill === "string") target.set("fill", fill)

          target.setCoords()
          canvas.renderAll()
          console.log("위치 업데이트됨:", target)
        }
      }
    }

    socket.onclose = () => {
      console.log("WebSocket 연결 종료")
    }

    socket.onerror = (err) => {
      console.error("WebSocket 에러", err)
    }

    return () => {
      socket.close()
    }
  }, [roomId])

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    const canvas = new FabricCanvas(canvasEl, {
      isDrawingMode: false,
      selection: true,
    })
    fabricCanvasRef.current = canvas

    canvas.on("path:created", (e) => {
      const path = e.path as Path & { id?: string }
      path.id = uuidv4()

      socketRef.current?.send(
        JSON.stringify({
          type: "add-object",
          roomId,
          payload: { ...path.toObject(), id: path.id },
        }),
      )
    })

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

    const deleteHandler = (e: TPointerEventInfo<TPointerEvent>) => {
      if (activeTool !== "delete") return

      const canvas = fabricCanvasRef.current
      if (!canvas) return

      const pointer = canvas.getPointer(e.e)
      const point = new Point(pointer.x, pointer.y)

      const objects = canvas.getObjects()
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        if (obj.containsPoint(point)) {
          canvas.remove(obj)
          canvas.requestRenderAll()

          const objectId = (obj as { id?: string }).id
          if (objectId && socketRef.current) {
            socketRef.current.send(
              JSON.stringify({
                type: "delete-object",
                roomId,
                payload: { id: objectId },
              }),
            )
          }
          break
        }
      }
    }

    const saveHandler = () => {
      if (!canvas || !roomId) return

      saveCanvasState(roomId, canvas)

      const activeObject = canvas.getActiveObject()
      if (activeObject && "toObject" in activeObject && "id" in activeObject) {
        const payload = {
          ...activeObject.toObject(),
          id: (activeObject as { id?: string }).id,
        }

        socketRef.current?.send(
          JSON.stringify({
            type: "update-object",
            roomId,
            payload,
          }),
        )
      }
    }

    canvas.on("mouse:down", deleteHandler)
    canvas.on("object:added", saveHandler)
    canvas.on("object:modified", saveHandler)
    canvas.on("object:removed", saveHandler)

    return () => {
      canvas.off("mouse:down", deleteHandler)
      canvas.off("object:added", saveHandler)
      canvas.off("object:modified", saveHandler)
      canvas.off("object:removed", saveHandler)
    }
  }, [activeTool, roomId])

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !roomId || !socketRef.current) return

    canvas.isDrawingMode = false

    const text = new IText("텍스트", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: selectedColor,
      editable: true,
    }) as IText & { id?: string }

    text.id = uuidv4()

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    setActiveTool("text")

    const payload = {
      ...text.toObject(),
      id: text.id,
    }

    socketRef.current.send(
      JSON.stringify({
        type: "add-object",
        roomId,
        payload,
      }),
    )
  }

  const handleDraw = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const brush = new PencilBrush(canvas)
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

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 70,
      fill: "lightblue",
      selectable: true,
    }) as Rect & { id?: string }

    rect.id = uuidv4()

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    setActiveTool("rect")

    const payload = {
      ...rect.toObject(),
      id: rect.id,
    }

    socketRef.current?.send(
      JSON.stringify({
        type: "add-object",
        roomId,
        payload,
      }),
    )
  }

  const handleAddCircle = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false

    const circle = new Circle({
      left: 150,
      top: 150,
      radius: 40,
      fill: "lightgreen",
      selectable: true,
    }) as Circle & { id?: string }

    circle.id = uuidv4()

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    setActiveTool("circle")

    const payload = {
      ...circle.toObject(),
      id: circle.id,
    }

    socketRef.current?.send(
      JSON.stringify({
        type: "add-object",
        roomId,
        payload,
      }),
    )
  }

  const handleAddTriangle = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !roomId || !socketRef.current) return

    canvas.isDrawingMode = false

    const triangle = new Triangle({
      left: 200,
      top: 200,
      width: 80,
      height: 80,
      fill: "pink",
      selectable: true,
    }) as Triangle & { id?: string }

    triangle.id = uuidv4()

    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll()
    setActiveTool("triangle")

    const payload = {
      ...triangle.toObject(),
      id: triangle.id,
    }

    socketRef.current.send(
      JSON.stringify({
        type: "add-object",
        roomId,
        payload,
      }),
    )
  }

  const handleAddDiamond = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false

    const diamond = new Polygon(
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
    ) as Polygon & { id?: string }

    diamond.id = uuidv4()

    canvas.add(diamond)
    canvas.setActiveObject(diamond)
    canvas.renderAll()
    setActiveTool("diamond")

    const payload = {
      ...diamond.toObject(),
      id: diamond.id,
    }

    socketRef.current?.send(
      JSON.stringify({
        type: "add-object",
        roomId,
        payload,
      }),
    )
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

      socketRef.current?.send(
        JSON.stringify({
          type: "update-object",
          roomId,
          payload: { ...activeObject.toObject(), id: activeObject.id },
        }),
      )
    }

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = newColor
    }
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = fabricCanvasRef.current
    const file = e.target.files?.[0]
    if (!canvas || !file || !roomId || !socketRef.current) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const fabricImg = new FabricImage(img, {
          left: 100,
          top: 100,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
        }) as FabricImage & { id?: string }

        fabricImg.id = uuidv4()

        canvas.add(fabricImg)
        canvas.setActiveObject(fabricImg)
        canvas.renderAll()
        setActiveTool("image")

        const payload = {
          ...fabricImg.toObject(),
          id: fabricImg.id,
          src: img.src,
        }

        if (socketRef.current) {
          socketRef.current.send(
            JSON.stringify({
              type: "add-object",
              roomId,
              payload,
            }),
          )
        }
      }
      img.src = dataUrl
    }

    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function getDisplayName(): string {
    const user = auth.currentUser
    if (user?.displayName) return user.displayName

    const storedName = sessionStorage.getItem("guestName")
    if (storedName) return storedName

    const randomNum = Math.floor(Math.random() * 1000)
    const name = `유저 ${randomNum}`
    sessionStorage.setItem("guestName", name)
    return name
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
          <Title> 도형 </Title>
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
        <Section>
          <Title>참여 유저</Title>
          <JoinUser>
            {userList.map((name, idx) => (
              <JoinUserList key={idx}>{name}</JoinUserList>
            ))}
          </JoinUser>
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

const JoinUser = styled.div``
const JoinUserList = styled.li`
  list-style-type: none;
`
