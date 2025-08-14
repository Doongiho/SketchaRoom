import type { TPointerEvent, TPointerEventInfo } from "fabric"
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
} from "fabric"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import BackButton from "../../components/ackButton"
import { auth } from "../../libs/firebase"
import { loadCanvasState, saveCanvasState } from "../../stores/useCanvasStore"

import {
  BackDiv,
  Button,
  CanvasEl,
  CanvasWrapper,
  ColorPicker,
  GlobalStyle,
  JoinUser,
  JoinUserList,
  Section,
  Title,
  Toolbar,
  ToolbarToggleButton,
  ToolRow,
  Wrapper,
} from "../../features/canvasStyles"
import {
  BASE_H,
  BASE_W,
  enlivenObjectsAsync,
  ensureImageFromObjectOnce,
  extendToObjectWithId,
  fitToWindow,
  isMobile,
  isPortrait,
  promptLandscapeOnce,
} from "../../features/canvasUtils"
import {
  hasId,
  type WithId,
  type WsAddObjectMsg,
  type WsDeleteObjectMsg,
  type WsInbound,
  type WsJoinMsg,
  type WsUpdateObjectMsg,
  type WsUpdatePayload,
} from "../../types/canvas"

/* toObject에 id/src 포함 등록 */
extendToObjectWithId(Path)
extendToObjectWithId(Rect)
extendToObjectWithId(Circle)
extendToObjectWithId(Triangle)
extendToObjectWithId(Polygon)
extendToObjectWithId(IText)
extendToObjectWithId(FabricImage)

const CanvasRoomPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { roomId = "" } = useParams<{ roomId?: string }>()
  const fabricCanvasRef = useRef<FabricCanvas | null>(null)
  const [activeTool, setActiveTool] = useState<
    | ""
    | "text"
    | "draw"
    | "delete"
    | "rect"
    | "circle"
    | "triangle"
    | "diamond"
    | "image"
  >("")
  const [selectedColor, setSelectedColor] = useState("#000000")
  const socketRef = useRef<WebSocket | null>(null)
  const [userList, setUserList] = useState<string[]>([])
  const [toolbarOpen, setToolbarOpen] = useState(false)

  /* WebSocket & FabricImage.fromObject 등록 */
  useEffect(() => {
    if (!roomId) return

    ensureImageFromObjectOnce()

    const socket = new WebSocket("wss://sketcharoom.onrender.com")
    socketRef.current = socket

    socket.onopen = () => {
      const join: WsJoinMsg = {
        type: "join-room",
        roomId,
        name: getDisplayName(),
      }
      socket.send(JSON.stringify(join))
    }

    socket.onmessage = async (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as WsInbound

      if (data.type === "user-list") {
        setUserList(data.payload)
      }

      if (data.type === "add-object" && fabricCanvasRef.current) {
        const objs = await enlivenObjectsAsync([data.payload])
        objs.forEach((o) => fabricCanvasRef.current!.add(o))
        fabricCanvasRef.current!.requestRenderAll()
      }

      if (data.type === "delete-object" && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current
        const target = canvas
          .getObjects()
          .find((o) => hasId(o) && o.id === data.payload.id)
        if (target) {
          canvas.remove(target)
          canvas.requestRenderAll()
        }
      }

      if (data.type === "update-object" && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current
        const target = canvas
          .getObjects()
          .find((o) => hasId(o) && o.id === data.payload.id)
        if (target) {
          const { left, top, angle, scaleX, scaleY, fill } = data.payload
          if (typeof left === "number") target.set("left", left)
          if (typeof top === "number") target.set("top", top)
          if (typeof angle === "number") target.set("angle", angle)
          if (typeof scaleX === "number") target.set("scaleX", scaleX)
          if (typeof scaleY === "number") target.set("scaleY", scaleY)
          if (typeof fill === "string") target.set("fill", fill)
          target.setCoords()
          canvas.renderAll()
        }
      }
    }

    socket.onerror = (ev) => {
      const s = socketRef.current
      const state = s ? s.readyState : WebSocket.CLOSED
      console.error("[WS] error", { event: ev, readyState: state, url: s?.url })
    }

    socket.onclose = (ev) => {
      console.warn("[WS] close", {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean,
      })
    }
    return () => socket.close()
  }, [roomId])

  /* 캔버스 초기화 + 반응형 fit */
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl || !roomId) return

    let disposed = false

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    const canvas = new FabricCanvas(canvasEl, {
      isDrawingMode: false,
      selection: true,
      width: BASE_W,
      height: BASE_H,
      enableRetinaScaling: false,
    })
    fabricCanvasRef.current = canvas

    canvasEl.style.width = "100%"
    canvasEl.style.height = "100%"

    canvas.on("path:created", (e) => {
      const path = e.path as WithId<Path>
      path.id = uuidv4()
      socketRef.current?.send(
        JSON.stringify({
          type: "add-object",
          roomId, // roomId는 이제 항상 string
          payload: { ...path.toObject(), id: path.id },
        } satisfies WsAddObjectMsg),
      )
    })

    const fit = () => {
      if (disposed) return
      const wrapper = document.getElementById("canvas-wrapper")
      if (!wrapper) return

      const viewW = wrapper.clientWidth
      const viewH = wrapper.clientHeight

      if (viewW <= 0 || viewH <= 0) return

      const ctxs = canvas as unknown as {
        contextContainer?: CanvasRenderingContext2D
        contextTop?: CanvasRenderingContext2D
      }
      if (!ctxs.contextContainer /* || !ctxs.contextTop */) return

      fitToWindow(canvas, wrapper)
    }

    fit()
    window.addEventListener("resize", fit)

    const tid = window.setTimeout(() => {
      if (!disposed) loadCanvasState(roomId, canvas)
    }, 100)

    return () => {
      disposed = true
      window.clearTimeout(tid)
      window.removeEventListener("resize", fit)
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [roomId])

  /* 저장/삭제/수정 동기화 */
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !roomId) return

    const deleteHandler = (e: TPointerEventInfo<TPointerEvent>) => {
      if (activeTool !== "delete") return
      const pointer = canvas.getPointer(e.e)
      const pt = new Point(pointer.x, pointer.y)
      const objects = canvas.getObjects()
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        if (obj.containsPoint(pt)) {
          canvas.remove(obj)
          canvas.requestRenderAll()
          if (hasId(obj) && obj.id) {
            const msg: WsDeleteObjectMsg = {
              type: "delete-object",
              roomId,
              payload: { id: obj.id },
            }
            socketRef.current?.send(JSON.stringify(msg))
          }
          break
        }
      }
    }

    const saveHandler = () => {
      if (!canvas || !roomId) return
      saveCanvasState(roomId, canvas)
      const activeObject = canvas.getActiveObject()
      if (activeObject && hasId(activeObject) && activeObject.id) {
        const payload: WsUpdatePayload = {
          id: activeObject.id,
          ...(activeObject.toObject() as Record<string, unknown>),
        }
        const msg: WsUpdateObjectMsg = {
          type: "update-object",
          roomId,
          payload,
        }
        socketRef.current?.send(JSON.stringify(msg))
      }
    }

    if (activeTool === "delete") canvas.on("mouse:move", deleteHandler)
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

  /* 모바일 세로 → 가로 알림 */
  useEffect(() => {
    const check = () => {
      if (!isMobile()) return
      if (isPortrait()) promptLandscapeOnce()
    }
    check()

    const onResize = () => check()
    window.addEventListener("resize", onResize)

    const so = (screen as Screen & { orientation?: ScreenOrientation })
      .orientation
    const onOrientationChange: EventListener = () => check()

    if (so && typeof so.addEventListener === "function") {
      so.addEventListener("change", onOrientationChange)
    } else {
      window.addEventListener("orientationchange", onOrientationChange)
    }

    const onVisibility = () => {
      if (!document.hidden) check()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("resize", onResize)
      if (so && typeof so.removeEventListener === "function") {
        so.removeEventListener(
          "change",
          onOrientationChange as (ev: Event) => void,
        )
      }
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  /* 그리기 도구  */
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
    }) as WithId<IText>
    text.id = uuidv4()
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    setActiveTool("text")
    const msg: WsAddObjectMsg = {
      type: "add-object",
      roomId,
      payload: { ...text.toObject(), id: text.id },
    }
    socketRef.current.send(JSON.stringify(msg))
  }

  const handleDraw = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = false
    const brush = new PencilBrush(canvas)
    const desiredWidth = 2
    const z = canvas.getZoom() || 1
    brush.width = desiredWidth / z
    brush.color = selectedColor
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
    }) as WithId<Rect>
    rect.id = uuidv4()
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    setActiveTool("rect")
    const msg: WsAddObjectMsg = {
      type: "add-object",
      roomId,
      payload: { ...rect.toObject(), id: rect.id },
    }
    socketRef.current?.send(JSON.stringify(msg))
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
    }) as WithId<Circle>
    circle.id = uuidv4()
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    setActiveTool("circle")
    const msg: WsAddObjectMsg = {
      type: "add-object",
      roomId,
      payload: { ...circle.toObject(), id: circle.id },
    }
    socketRef.current?.send(JSON.stringify(msg))
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
    }) as WithId<Triangle>
    triangle.id = uuidv4()
    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll()
    setActiveTool("triangle")
    const msg: WsAddObjectMsg = {
      type: "add-object",
      roomId,
      payload: { ...triangle.toObject(), id: triangle.id },
    }
    socketRef.current.send(JSON.stringify(msg))
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
    ) as WithId<Polygon>
    diamond.id = uuidv4()
    canvas.add(diamond)
    canvas.setActiveObject(diamond)
    canvas.renderAll()
    setActiveTool("diamond")
    const msg: WsAddObjectMsg = {
      type: "add-object",
      roomId,
      payload: { ...diamond.toObject(), id: diamond.id },
    }
    socketRef.current?.send(JSON.stringify(msg))
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setSelectedColor(newColor)
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.set("fill", newColor)
      canvas.renderAll()
      if (hasId(activeObject) && activeObject.id) {
        const msg: WsUpdateObjectMsg = {
          type: "update-object",
          roomId,
          payload: {
            id: activeObject.id,
            ...(activeObject.toObject() as Record<string, unknown>),
          },
        }
        socketRef.current?.send(JSON.stringify(msg))
      }
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
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result
      if (typeof dataUrl !== "string") return

      const img = new Image()
      img.onload = () => {
        const fabricImg = new FabricImage(img, {
          left: 100,
          top: 100,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
        }) as WithId<FabricImage>
        fabricImg.id = uuidv4()
        canvas.add(fabricImg)
        canvas.setActiveObject(fabricImg)
        canvas.renderAll()
        setActiveTool("image")
        const msg: WsAddObjectMsg = {
          type: "add-object",
          roomId,
          payload: { ...fabricImg.toObject(), id: fabricImg.id, src: img.src },
        }
        socketRef.current!.send(JSON.stringify(msg))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function getDisplayName(): string {
    const user = auth.currentUser
    if (user?.displayName) return user.displayName
    const stored = sessionStorage.getItem("guestName")
    if (stored) return stored
    const name = `유저 ${Math.floor(Math.random() * 1000)}`
    sessionStorage.setItem("guestName", name)
    return name
  }

  const toggleToolbar = () => setToolbarOpen((prev) => !prev)

  if (!roomId) {
    return null
  }

  return (
    <Wrapper>
      <GlobalStyle />
      <CanvasWrapper id="canvas-wrapper">
        <CanvasEl id="canvas" ref={canvasRef} />
      </CanvasWrapper>

      <Toolbar $mobileVisible={toolbarOpen}>
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
        <Section>
          <Title>참여 유저</Title>
          <JoinUser>
            {userList.map((name) => (
              <JoinUserList key={name}>{name}</JoinUserList>
            ))}
          </JoinUser>
        </Section>
      </Toolbar>

      <BackDiv>
        <BackButton />
      </BackDiv>
      <ToolbarToggleButton onClick={toggleToolbar}>
        {toolbarOpen ? "도구 닫기" : "도구 열기"}
      </ToolbarToggleButton>
    </Wrapper>
  )
}

export default CanvasRoomPage
