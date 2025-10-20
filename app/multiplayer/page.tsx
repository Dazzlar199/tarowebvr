"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/contexts/SocketContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MultiplayerPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { isConnected, roomList, currentRoom, createRoom, joinRoom, refreshRoomList } = useSocket()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [username, setUsername] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(10)

  useEffect(() => {
    if (isConnected) {
      refreshRoomList()
      const interval = setInterval(refreshRoomList, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isConnected, refreshRoomList])

  useEffect(() => {
    if (currentRoom) {
      router.push(`/multiplayer/lobby/${currentRoom.id}`)
    }
  }, [currentRoom, router])

  const handleCreateRoom = () => {
    if (!roomName.trim() || !username.trim()) {
      alert('Please enter room name and username')
      return
    }
    createRoom(roomName, username, maxPlayers)
    setShowCreateModal(false)
    setRoomName('')
  }

  const handleJoinRoom = (roomId: string) => {
    if (!username.trim()) {
      alert('Please enter your username first')
      return
    }
    joinRoom(roomId, username)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel p-8 text-center">
          <div className="divine-spinner mx-auto mb-4"></div>
          <p className="text-green-400">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 mystical-text">MULTIPLAYER</h1>
          <p className="text-gray-400 tracking-wide">Experience dilemmas together</p>
        </motion.div>

        {/* Username Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel p-6 mb-8"
        >
          <label className="block text-xs font-bold tracking-wider text-green-400 mb-3">
            YOUR USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 bg-black/60 border border-green-400/30 text-gray-300 text-sm placeholder-gray-600 focus:border-green-400 focus:outline-none"
            maxLength={20}
          />
        </motion.div>

        {/* Create Room Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!username.trim()}
            className="w-full py-4 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + CREATE NEW ROOM
          </button>
        </motion.div>

        {/* Room List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold tracking-wider text-green-400 mb-4">
            AVAILABLE ROOMS ({roomList.length})
          </h2>

          {roomList.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-gray-500 text-sm tracking-wide">No rooms available. Create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomList.map((room) => (
                <div key={room.id} className="panel p-6 border border-green-400/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-green-400 tracking-wider mb-1">
                        {room.name}
                      </h3>
                      <p className="text-xs text-gray-500 tracking-wide">
                        ID: {room.id}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold tracking-wider ${
                      room.status === 'waiting'
                        ? 'bg-green-400/20 text-green-400'
                        : room.status === 'playing'
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-gray-400/20 text-gray-400'
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <span className="text-green-400 font-bold">{room.playerCount}</span>
                      <span className="text-gray-600"> / {room.maxPlayers}</span>
                      <span className="ml-2 text-gray-600">players</span>
                    </div>

                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={
                        !username.trim() ||
                        room.playerCount >= room.maxPlayers ||
                        room.status !== 'waiting'
                      }
                      className="px-6 py-2 bg-black/60 border border-green-400/30 text-green-400 text-xs font-bold tracking-wider hover:bg-green-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      JOIN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel p-8 max-w-md w-full border border-green-400/30"
          >
            <h2 className="text-2xl font-bold tracking-wider text-green-400 mb-6">
              CREATE ROOM
            </h2>

            <div className="mb-6">
              <label className="block text-xs font-bold tracking-wider text-green-400 mb-3">
                ROOM NAME
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 bg-black/60 border border-green-400/30 text-gray-300 text-sm placeholder-gray-600 focus:border-green-400 focus:outline-none"
                maxLength={30}
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold tracking-wider text-green-400 mb-3">
                MAX PLAYERS
              </label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Math.min(50, Math.max(2, parseInt(e.target.value) || 2)))}
                min="2"
                max="50"
                className="w-full px-4 py-3 bg-black/60 border border-green-400/30 text-gray-300 text-sm focus:border-green-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-black/60 border border-green-400/30 text-gray-400 text-sm font-bold tracking-wider hover:bg-black/80 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
                className="flex-1 py-3 bg-green-400 text-black text-sm font-bold tracking-wider hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CREATE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
