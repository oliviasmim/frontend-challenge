import { io, type Socket } from 'socket.io-client'
import { REALTIME_URL } from './realtimeUrl'

let socket: Socket | null = null

/**
 * Um único socket por aba. Só o transporte websocket: o binding do MSW intercepta
 * WebSocket, não o long-polling HTTP do Engine.IO.
 */
export function getSocket(): Socket {
  socket ??= io(REALTIME_URL, { transports: ['websocket'], autoConnect: true })
  return socket
}
