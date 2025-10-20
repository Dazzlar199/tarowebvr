"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  username: string
  choice: 'A' | 'B' | null
  position: [number, number, number]
  rotation?: [number, number, number]
}

interface Room {
  id: string
  name: string
  hostId: string
  dilemmaId: string | null
  players: Player[]
  maxPlayers: number
  status: 'waiting' | 'playing' | 'completed'
  createdAt: number
}

interface RoomListItem {
  id: string
  name: string
  playerCount: number
  maxPlayers: number
  status: 'waiting' | 'playing' | 'completed'
  createdAt: number
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  currentRoom: Room | null
  roomList: RoomListItem[]

  // Room actions
  createRoom: (roomName: string, username: string, maxPlayers?: number) => void
  joinRoom: (roomId: string, username: string) => void
  leaveRoom: () => void
  startDilemma: (dilemmaId: string) => void
  makeChoice: (choice: 'A' | 'B') => void
  updatePosition: (position: [number, number, number], rotation?: [number, number, number]) => void
  refreshRoomList: () => void

  // Event listeners
  onRoomUpdated: (callback: (room: Room) => void) => () => void
  onPlayerJoined: (callback: (player: Player) => void) => () => void
  onPlayerLeft: (callback: (data: { playerId: string, username: string }) => void) => () => void
  onPlayerChoice: (callback: (data: { playerId: string, username: string, choice: 'A' | 'B' }) => void) => () => void
  onPlayerMoved: (callback: (data: { playerId: string, username: string, position: [number, number, number], rotation?: [number, number, number] }) => void) => () => void
  onDilemmaStarted: (callback: (data: { dilemmaId: string }) => void) => () => void
  onRoomCompleted: (callback: (results: any) => void) => () => void
  onHostChanged: (callback: (data: { newHostId: string, newHostUsername: string }) => void) => () => void
  onError: (callback: (data: { message: string }) => void) => () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [roomList, setRoomList] = useState<RoomListItem[]>([])

  useEffect(() => {
    // Initialize Socket.io connection
    const socketInstance = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server')
      setIsConnected(false)
      setCurrentRoom(null)
    })

    // Room events
    socketInstance.on('room-created', ({ room }: { roomId: string, room: Room }) => {
      console.log('🏠 Room created:', room.id)
      setCurrentRoom(room)
    })

    socketInstance.on('room-joined', ({ room }: { roomId: string, room: Room }) => {
      console.log('🏠 Room joined:', room.id)
      setCurrentRoom(room)
    })

    socketInstance.on('room-updated', (room: Room) => {
      setCurrentRoom(room)
    })

    socketInstance.on('rooms-list', (rooms: RoomListItem[]) => {
      setRoomList(rooms)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Room actions
  const createRoom = (roomName: string, username: string, maxPlayers = 10) => {
    if (!socket) return
    socket.emit('create-room', { roomName, username, maxPlayers })
  }

  const joinRoom = (roomId: string, username: string) => {
    if (!socket) return
    socket.emit('join-room', { roomId, username })
  }

  const leaveRoom = () => {
    if (!socket) return
    socket.emit('leave-room')
    setCurrentRoom(null)
  }

  const startDilemma = (dilemmaId: string) => {
    if (!socket || !currentRoom) return
    socket.emit('start-dilemma', { roomId: currentRoom.id, dilemmaId })
  }

  const makeChoice = (choice: 'A' | 'B') => {
    if (!socket) return
    socket.emit('make-choice', { choice })
  }

  const updatePosition = (position: [number, number, number], rotation?: [number, number, number]) => {
    if (!socket) return
    socket.emit('update-position', { position, rotation })
  }

  const refreshRoomList = () => {
    if (!socket) return
    socket.emit('get-rooms')
  }

  // Event listener helpers
  const onRoomUpdated = (callback: (room: Room) => void) => {
    if (!socket) return () => {}
    socket.on('room-updated', callback)
    return () => { socket.off('room-updated', callback) }
  }

  const onPlayerJoined = (callback: (player: Player) => void) => {
    if (!socket) return () => {}
    socket.on('player-joined', callback)
    return () => { socket.off('player-joined', callback) }
  }

  const onPlayerLeft = (callback: (data: { playerId: string, username: string }) => void) => {
    if (!socket) return () => {}
    socket.on('player-left', callback)
    return () => { socket.off('player-left', callback) }
  }

  const onPlayerChoice = (callback: (data: { playerId: string, username: string, choice: 'A' | 'B' }) => void) => {
    if (!socket) return () => {}
    socket.on('player-choice', callback)
    return () => { socket.off('player-choice', callback) }
  }

  const onPlayerMoved = (callback: (data: { playerId: string, username: string, position: [number, number, number], rotation?: [number, number, number] }) => void) => {
    if (!socket) return () => {}
    socket.on('player-moved', callback)
    return () => { socket.off('player-moved', callback) }
  }

  const onDilemmaStarted = (callback: (data: { dilemmaId: string }) => void) => {
    if (!socket) return () => {}
    socket.on('dilemma-started', callback)
    return () => { socket.off('dilemma-started', callback) }
  }

  const onRoomCompleted = (callback: (results: any) => void) => {
    if (!socket) return () => {}
    socket.on('room-completed', callback)
    return () => { socket.off('room-completed', callback) }
  }

  const onHostChanged = (callback: (data: { newHostId: string, newHostUsername: string }) => void) => {
    if (!socket) return () => {}
    socket.on('host-changed', callback)
    return () => { socket.off('host-changed', callback) }
  }

  const onError = (callback: (data: { message: string }) => void) => {
    if (!socket) return () => {}
    socket.on('error', callback)
    return () => { socket.off('error', callback) }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    currentRoom,
    roomList,
    createRoom,
    joinRoom,
    leaveRoom,
    startDilemma,
    makeChoice,
    updatePosition,
    refreshRoomList,
    onRoomUpdated,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerChoice,
    onPlayerMoved,
    onDilemmaStarted,
    onRoomCompleted,
    onHostChanged,
    onError
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}
