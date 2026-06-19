import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'

export function useWebSocket({ roomId, onMessage, onUserList }) {
  const token = useAuthStore((s) => s.token)
  const clientRef = useRef(null)

  const connect = useCallback(() => {
    if (clientRef.current?.active) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`/ws?token=${token}`),
      connectHeaders: { token: token || '' },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body)
            onMessage && onMessage(msg)
          } catch (e) {}
        })
        client.subscribe(`/topic/room/${roomId}/users`, (frame) => {
          try {
            const users = JSON.parse(frame.body)
            onUserList && onUserList(users)
          } catch (e) {}
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame)
      },
    })

    client.activate()
    clientRef.current = client
  }, [roomId, token, onMessage, onUserList])

  const sendMessage = useCallback((content) => {
    if (clientRef.current?.active) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/send`,
        body: JSON.stringify({ content }),
      })
    }
  }, [roomId])

  useEffect(() => {
    connect()
    return () => {
      clientRef.current?.deactivate()
    }
  }, [connect])

  return { sendMessage }
}
