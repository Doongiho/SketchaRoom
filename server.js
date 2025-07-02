import http from "http"
import { WebSocketServer } from "ws"

const PORT = process.env.PORT || 8080

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("🟢 WebSocket Server is alive")
})

const wss = new WebSocketServer({ server })

let rooms = {}

wss.on("connection", (ws, req) => {
  let currentRoom = null

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message)
      const { type, roomId, payload, name } = parsed

      if (type === "join-room") {
        currentRoom = roomId
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = new Set()
        }
        ws.username = name
        rooms[currentRoom].add(ws)

        const names = Array.from(rooms[currentRoom]).map(
          (client) => client.username,
        )
        rooms[currentRoom].forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "user-list",
                roomId,
                payload: names,
              }),
            )
          }
        })
        return
      }

      if (currentRoom && rooms[currentRoom]) {
        rooms[currentRoom].forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify(parsed))
          }
        })
      }
    } catch (err) {
      console.error("❌ message error", err)
    }
  })

  ws.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws)
      if (rooms[currentRoom].size === 0) {
        delete rooms[currentRoom]
      }
    }
  })
})

server.listen(PORT, "0.0.0.0", () => {})
