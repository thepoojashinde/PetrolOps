import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

let socket = null

export function getSocket() {
  return socket ?? null
}

export function connectSocket(token) {
  if (socket) return socket
  socket = io(socketUrl, { auth: { token } })
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}

