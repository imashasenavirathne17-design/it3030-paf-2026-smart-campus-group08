import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import React from 'react'

const SOCKET_URL = 'http://localhost:8080/ws'

export default function useNotifications() {
   const { user, token } = useAuth()
  const stompClient = useRef(null)
  const [criticalMessage, setCriticalMessage] = useState(null)

  useEffect(() => {
    if (!user || !token) return

    const socket = new SockJS(SOCKET_URL)
    const client = Stomp.over(socket)
    client.debug = null // Disable logging in production

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      stompClient.current = client
      
      // Subscribe to user-specific notification queue
       client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body)
        
        // Handle critical announcement
        if (notification.type === 'CRITICAL_ANNOUNCEMENT') {
          setCriticalMessage(notification.message)
          return
        }

        // Show toast notification
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-custom`}>
            <div className="toast-icon">
              <Bell size={20} color="var(--primary)" />
            </div>
            <div className="toast-content">
              <p className="toast-title">New Notification</p>
              <p className="toast-message">{notification.message}</p>
            </div>
          </div>
        ), { duration: 5000 })
      })
    }, (error) => {
      console.error('WebSocket connection error:', error)
    })

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect()
      }
    }
  }, [user, token])

   return { criticalMessage, setCriticalMessage }
}
