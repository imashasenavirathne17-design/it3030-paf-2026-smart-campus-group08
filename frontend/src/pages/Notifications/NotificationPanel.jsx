import React, { useState, useEffect, useCallback } from 'react'
import { MdNotificationsNone, MdClearAll, MdCheck, MdDelete, MdInfo, MdWarning, MdError } from 'react-icons/md'
import { format } from 'date-fns'
import notificationService from '../../services/notificationService'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationService.getAll()
      setNotifications(res.data)
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      toast.error('Failed to update notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch (err) {
      toast.error('Failed to update notifications')
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <MdInfo className="text-teal" />
      case 'TICKET': return <MdWarning style={{ color: 'var(--yellow-500)' }} />
      case 'SYSTEM': return <MdError className="text-coral" />
      default: return <MdNotificationsNone />
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your bookings, tickets, and campus alerts.</p>
        </div>
        
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <button className="btn btn-ghost" onClick={handleMarkAllAsRead}>
              <MdClearAll size={20} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">No notifications</div>
          <div className="empty-state-desc">You're all caught up! New alerts will appear here.</div>
        </div>
      ) : (
        <div className="flex flex-direction-column gap-3">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass-card flex items-start gap-4 ${!n.read ? 'unread-notification' : ''}`}
                style={{ 
                  padding: '16px 20px', 
                  borderLeft: !n.read ? '4px solid var(--teal-500)' : '1px solid var(--border)',
                  background: !n.read ? 'rgba(20, 184, 166, 0.05)' : 'var(--glass-bg)'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-start">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{n.title}</h4>
                    <span className="text-xs text-muted">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="text-sm text-secondary mt-1">{n.message}</p>
                  
                  <div className="flex gap-3 mt-3">
                    {!n.read && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)} 
                        className="btn-ghost btn-sm text-teal"
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        <MdCheck size={14} /> Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(n.id)} 
                      className="btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      <MdDelete size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .unread-notification {
           box-shadow: 0 0 20px rgba(20, 184, 166, 0.1);
        }
      `}} />
    </div>
  )
}

export default NotificationPanel
