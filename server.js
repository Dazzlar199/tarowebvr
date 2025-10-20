const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Room management
const rooms = new Map()

// Room data structure:
// {
//   id: string,
//   name: string,
//   hostId: string,
//   dilemmaId: string | null,
//   players: [{ id: string, username: string, choice: 'A' | 'B' | null, position: [x,y,z] }],
//   maxPlayers: number,
//   status: 'waiting' | 'playing' | 'completed'
// }

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)

    // Create room
    socket.on('create-room', ({ roomName, username, maxPlayers = 10 }) => {
      const roomId = generateRoomId()
      const room = {
        id: roomId,
        name: roomName,
        hostId: socket.id,
        dilemmaId: null,
        players: [{
          id: socket.id,
          username: username || 'Anonymous',
          choice: null,
          position: [0, 1.6, 0]
        }],
        maxPlayers,
        status: 'waiting',
        createdAt: Date.now()
      }

      rooms.set(roomId, room)
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.username = username

      console.log(`🏠 Room created: ${roomId} by ${username}`)

      socket.emit('room-created', { roomId, room })
      io.to(roomId).emit('room-updated', room)
    })

    // Join room
    socket.on('join-room', ({ roomId, username }) => {
      const room = rooms.get(roomId)

      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: 'Room is full' })
        return
      }

      if (room.status === 'completed') {
        socket.emit('error', { message: 'Room is already completed' })
        return
      }

      const player = {
        id: socket.id,
        username: username || 'Anonymous',
        choice: null,
        position: [
          Math.random() * 4 - 2, // Random x position
          1.6,
          Math.random() * 4 - 2  // Random z position
        ]
      }

      room.players.push(player)
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.username = username

      console.log(`👤 ${username} joined room: ${roomId}`)

      socket.emit('room-joined', { roomId, room })
      io.to(roomId).emit('room-updated', room)
      io.to(roomId).emit('player-joined', { player })
    })

    // Leave room
    socket.on('leave-room', () => {
      const roomId = socket.data.roomId
      if (!roomId) return

      handlePlayerLeave(socket, roomId)
    })

    // Start dilemma
    socket.on('start-dilemma', ({ roomId, dilemmaId }) => {
      const room = rooms.get(roomId)

      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (socket.id !== room.hostId) {
        socket.emit('error', { message: 'Only host can start the dilemma' })
        return
      }

      room.dilemmaId = dilemmaId
      room.status = 'playing'

      console.log(`🎭 Dilemma started in room ${roomId}: ${dilemmaId}`)

      io.to(roomId).emit('dilemma-started', { dilemmaId })
      io.to(roomId).emit('room-updated', room)
    })

    // Make choice
    socket.on('make-choice', ({ choice }) => {
      const roomId = socket.data.roomId
      const room = rooms.get(roomId)

      if (!room) return

      const player = room.players.find(p => p.id === socket.id)
      if (player) {
        player.choice = choice
        console.log(`✅ ${player.username} chose: ${choice}`)

        io.to(roomId).emit('player-choice', {
          playerId: socket.id,
          username: player.username,
          choice
        })
        io.to(roomId).emit('room-updated', room)

        // Check if all players made choices
        const allChosen = room.players.every(p => p.choice !== null)
        if (allChosen) {
          room.status = 'completed'
          const results = calculateResults(room)
          io.to(roomId).emit('room-completed', results)
        }
      }
    })

    // Update player position (for VR/3D movement)
    socket.on('update-position', ({ position, rotation }) => {
      const roomId = socket.data.roomId
      const room = rooms.get(roomId)

      if (!room) return

      const player = room.players.find(p => p.id === socket.id)
      if (player) {
        player.position = position
        if (rotation) player.rotation = rotation

        // Broadcast to other players in room
        socket.to(roomId).emit('player-moved', {
          playerId: socket.id,
          username: player.username,
          position,
          rotation
        })
      }
    })

    // Get room list
    socket.on('get-rooms', () => {
      const roomList = Array.from(rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        createdAt: room.createdAt
      }))

      socket.emit('rooms-list', roomList)
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)

      const roomId = socket.data.roomId
      if (roomId) {
        handlePlayerLeave(socket, roomId)
      }
    })
  })

  // Helper functions
  function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  function handlePlayerLeave(socket, roomId) {
    const room = rooms.get(roomId)
    if (!room) return

    const playerIndex = room.players.findIndex(p => p.id === socket.id)
    if (playerIndex === -1) return

    const player = room.players[playerIndex]
    room.players.splice(playerIndex, 1)

    console.log(`👋 ${player.username} left room: ${roomId}`)

    socket.leave(roomId)
    delete socket.data.roomId
    delete socket.data.username

    // If room is empty, delete it
    if (room.players.length === 0) {
      rooms.delete(roomId)
      console.log(`🗑️ Room deleted: ${roomId}`)
      return
    }

    // If host left, assign new host
    if (socket.id === room.hostId && room.players.length > 0) {
      room.hostId = room.players[0].id
      console.log(`👑 New host: ${room.players[0].username}`)
      io.to(roomId).emit('host-changed', {
        newHostId: room.hostId,
        newHostUsername: room.players[0].username
      })
    }

    io.to(roomId).emit('player-left', { playerId: socket.id, username: player.username })
    io.to(roomId).emit('room-updated', room)
  }

  function calculateResults(room) {
    const choiceA = room.players.filter(p => p.choice === 'A').length
    const choiceB = room.players.filter(p => p.choice === 'B').length

    return {
      total: room.players.length,
      choiceA,
      choiceB,
      percentageA: Math.round((choiceA / room.players.length) * 100),
      percentageB: Math.round((choiceB / room.players.length) * 100),
      players: room.players.map(p => ({
        username: p.username,
        choice: p.choice
      }))
    }
  }

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> WebSocket server running`)
    })
})
