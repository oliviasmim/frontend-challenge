import { useEffect, useState } from 'react'
import { getSocket } from './socket'

export function useSocketStatus(): 'conectado' | 'desconectado' {
  const [conectado, setConectado] = useState(() => getSocket().connected)
  useEffect(() => {
    const socket = getSocket()
    const on = () => setConectado(true)
    const off = () => setConectado(false)
    socket.on('connect', on)
    socket.on('disconnect', off)
    setConectado(socket.connected)
    return () => {
      socket.off('connect', on)
      socket.off('disconnect', off)
    }
  }, [])
  return conectado ? 'conectado' : 'desconectado'
}
