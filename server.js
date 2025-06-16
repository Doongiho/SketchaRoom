const WebSocket = require('ws');
const http = require('http');
const PORT = 8080;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let rooms = {}; 

wss.on('connection', (ws, req) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      const { type, roomId, payload } = parsed;

      if (type === 'join-room') {
        currentRoom = roomId;
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = new Set();
        }
        rooms[currentRoom].add(ws);
        console.log(`🟢 client joined room ${currentRoom}`);
        return;
      }

      if (currentRoom && rooms[currentRoom]) {
        rooms[currentRoom].forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsed));
          }
        });
      }
    } catch (err) {
      console.error('❌ message error', err);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) {
        delete rooms[currentRoom];
      }
    }
    console.log(`🔴 client left room ${currentRoom}`);
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket Server running on ws://localhost:${PORT}`);
});
