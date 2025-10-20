"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useSocket } from '@/contexts/SocketContext'

export default function LobbyPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string

  const {
    isConnected,
    currentRoom,
    leaveRoom,
    startDilemma,
    onRoomUpdated,
    onPlayerJoined,
    onPlayerLeft,
    onDilemmaStarted,
    onHostChanged,
    onError,
    socket
  } = useSocket()

  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!currentRoom && socket) {
      router.push('/multiplayer')
    }
  }, [currentRoom, router, socket])

  useEffect(() => {
    const unsubscribeUpdated = onRoomUpdated((room) => {
      console.log('Room updated:', room)
    })

    const unsubscribePlayerJoined = onPlayerJoined((player) => {
      console.log('Player joined:', player.username)
    })

    const unsubscribePlayerLeft = onPlayerLeft((data) => {
      console.log('Player left:', data.username)
    })

    const unsubscribeDilemmaStarted = onDilemmaStarted((data) => {
      console.log('Dilemma started:', data.dilemmaId)
      router.push(`/explore/${data.dilemmaId}?multiplayer=true&roomId=${roomId}`)
    })

    const unsubscribeHostChanged = onHostChanged((data) => {
      console.log('New host:', data.newHostUsername)
    })

    const unsubscribeError = onError((data) => {
      setErrorMessage(data.message)
      setTimeout(() => setErrorMessage(null), 3000)
    })

    return () => {
      unsubscribeUpdated()
      unsubscribePlayerJoined()
      unsubscribePlayerLeft()
      unsubscribeDilemmaStarted()
      unsubscribeHostChanged()
      unsubscribeError()
    }
  }, [onRoomUpdated, onPlayerJoined, onPlayerLeft, onDilemmaStarted, onHostChanged, onError, router, roomId])

  const handleLeaveRoom = () => {
    leaveRoom()
    router.push('/multiplayer')
  }

  const handleStartDilemma = async () => {
    if (!selectedDilemmaId) {
      setErrorMessage('Please select a dilemma first')
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    setIsStarting(true)
    startDilemma(selectedDilemmaId)
  }

  const handleGenerateNewDilemma = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('/api/dilemma/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAI: true })
      })

      const data = await response.json()

      if (data.success && data.data.dilemmaId) {
        setSelectedDilemmaId(data.data.dilemmaId)
        setIsStarting(false)
      } else {
        throw new Error(data.error || 'Failed to create dilemma')
      }
    } catch (error: any) {
      console.error('Failed to generate dilemma:', error)
      setErrorMessage('Failed to generate dilemma')
      setIsStarting(false)
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  if (!currentRoom || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel p-8 text-center">
          <div className="divine-spinner mx-auto mb-4"></div>
          <p className="text-green-400">Loading lobby...</p>
        </div>
      </div>
    )
  }

  const isHost = socket?.id === currentRoom.hostId
  const hostPlayer = currentRoom.players.find(p => p.id === currentRoom.hostId)

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel p-4 mb-6 border border-red-400/30 bg-red-400/10"
          >
            <p className="text-red-400 text-sm tracking-wide text-center">{errorMessage}</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 mystical-text">{currentRoom.name}</h1>
          <p className="text-gray-500 text-sm tracking-wider">ROOM ID: {currentRoom.id}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className={`px-4 py-2 text-xs font-bold tracking-wider ${
              currentRoom.status === 'waiting'
                ? 'bg-green-400/20 text-green-400'
                : currentRoom.status === 'playing'
                ? 'bg-yellow-400/20 text-yellow-400'
                : 'bg-gray-400/20 text-gray-400'
            }`}>
              {currentRoom.status.toUpperCase()}
            </span>
            {isHost && (
              <span className="px-4 py-2 text-xs font-bold tracking-wider bg-purple-400/20 text-purple-400">
                YOU ARE HOST
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="panel p-6 border border-green-400/20"
            >
              <h2 className="text-lg font-bold tracking-wider text-green-400 mb-4">
                PLAYERS ({currentRoom.players.length}/{currentRoom.maxPlayers})
              </h2>

              <div className="space-y-2">
                {currentRoom.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-black/40 border border-green-400/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300 tracking-wide">
                        {player.username}
                      </span>
                    </div>
                    {player.id === currentRoom.hostId && (
                      <span className="px-2 py-1 text-xs font-bold tracking-wider bg-purple-400/20 text-purple-400">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="panel p-6 border border-green-400/20"
            >
              <h2 className="text-lg font-bold tracking-wider text-green-400 mb-6">
                {isHost ? 'HOST CONTROLS' : 'WAITING FOR HOST'}
              </h2>

              {isHost ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-4 tracking-wide">
                      As the host, you can generate a new AI dilemma or start with an existing one.
                    </p>

                    <button
                      onClick={handleGenerateNewDilemma}
                      disabled={isStarting}
                      className="w-full py-4 mb-4 bg-black/60 border border-green-400/30 text-green-400 text-sm font-bold tracking-wider hover:bg-green-400/10 transition-all disabled:opacity-50"
                    >
                      {isStarting && !selectedDilemmaId ? (
                        <span className="flex items-center justify-center">
                          <span className="divine-spinner mr-3"></span>
                          GENERATING...
                        </span>
                      ) : (
                        '🎲 GENERATE NEW DILEMMA'
                      )}
                    </button>

                    {selectedDilemmaId && (
                      <div className="p-4 bg-green-400/10 border border-green-400/30 mb-4">
                        <p className="text-xs text-green-400 tracking-wide">
                          ✅ Dilemma ready: {selectedDilemmaId}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleStartDilemma}
                      disabled={!selectedDilemmaId || isStarting}
                      className="w-full py-4 bg-green-400 text-black text-sm font-bold tracking-wider hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStarting && selectedDilemmaId ? (
                        <span className="flex items-center justify-center">
                          <span className="divine-spinner mr-3"></span>
                          STARTING...
                        </span>
                      ) : (
                        '▶ START DILEMMA'
                      )}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-green-400/20">
                    <p className="text-xs text-gray-600 mb-2 tracking-wide">
                      HOST INFO
                    </p>
                    <p className="text-xs text-gray-500 tracking-wide">
                      If you leave, host will transfer to another player.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="divine-spinner mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm tracking-wide">
                    Waiting for {hostPlayer?.username || 'host'} to start the dilemma...
                  </p>
                </div>
              )}
            </motion.div>

            {/* Leave Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <button
                onClick={handleLeaveRoom}
                className="w-full py-3 bg-black/60 border border-red-400/30 text-red-400 text-sm font-bold tracking-wider hover:bg-red-400/10 transition-all"
              >
                LEAVE ROOM
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
