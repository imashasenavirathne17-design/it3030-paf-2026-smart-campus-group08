import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../api/notifications'
import { Bell, Check, CheckCheck, Calendar, Ticket, BookOpen, MessageSquare, Trash2, Search, ArrowRight, AlertTriangle, Send, X, Edit2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const typeConfig = {
  BOOKING_CREATED:   { icon: BookOpen, color: '#3b82f6', badge: 'badge-info' },
  BOOKING_APPROVED:  { icon: Check,    color: '#10B981', badge: 'badge-success' },
  BOOKING_REJECTED:  { icon: Trash2,   color: '#EF4444', badge: 'badge-danger' },
  BOOKING_CANCELLED: { icon: Trash2,   color: '#64748B', badge: 'badge-gray' },
  TICKET_CREATED:    { icon: Ticket,   color: '#F59E0B', badge: 'badge-warning' },
  TICKET_UPDATED:    { icon: Ticket,   color: '#3b82f6', badge: 'badge-info' },
  TICKET_ASSIGNED:   { icon: Ticket,   color: '#8B5CF6', badge: 'badge-purple' },
  TICKET_RESOLVED:   { icon: Check,    color: '#10B981', badge: 'badge-success' },
  COMMENT_ADDED:     { icon: MessageSquare, color: '#3b82f6', badge: 'badge-info' },
  SYSTEM_ALERT:      { icon: AlertTriangle, color: '#EF4444', badge: 'badge-danger' }
}

export default function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [editingBroadcastId, setEditingBroadcastId] = useState(null)
  const [errors, setErrors] = useState({})

  const load = () => notificationsAPI.getAll().then(setNotifications).catch(() => {}).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await notificationsAPI.markAllRead().catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this notification?')) return
    try {
      await notificationsAPI.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return
    try {
      await notificationsAPI.deleteAll()
      setNotifications([])
      toast.success('All notifications cleared')
    } catch {
      toast.error('Failed to clear notifications')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!broadcastMsg || !broadcastMsg.trim()) newErrors.broadcastMsg = 'Announcement message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendBroadcast = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    setBroadcasting(true)
    try {
      if (editingBroadcastId) {
        await notificationsAPI.updateBroadcast(editingBroadcastId, { message: broadcastMsg })
        toast.success('Broadcast updated for all users')
      } else {
        await notificationsAPI.broadcast({ message: broadcastMsg })
        toast.success('Broadcast sent to all users')
      }
      setShowBroadcastModal(false)
      setBroadcastMsg('')
      setEditingBroadcastId(null)
      load() // Reload to show the changes
    } catch {
      toast.error(editingBroadcastId ? 'Failed to update broadcast' : 'Failed to send broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  const handleNotificationClick = (n) => {
    if (!n.read) markRead(n.id)
    if (n.type.startsWith('TICKET') || n.type === 'COMMENT_ADDED') {
      navigate(`/tickets/${n.referenceId}`)
    } else if (n.type.startsWith('BOOKING')) {
      navigate('/bookings')
    }
  }

  const filtered = notifications.filter(n => 
    n.message.toLowerCase().includes(search.toLowerCase()) || 
    (n.type && n.type.toLowerCase().includes(search.toLowerCase()))
  )

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:100 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 
              ? `${unreadCount} unread update${unreadCount>1?'s':''} for your attention.` 
              : 'Your notification center is clear.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-outline btn-sm">
              <CheckCheck size={16}/> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="btn btn-danger btn-sm">
              <Trash2 size={16}/> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding:'14px 18px', marginBottom:24, display:'flex', gap:12, alignItems:'center' }}>
        <div className="input-wrapper" style={{ flex:1 }}>
          <Search size={16} className="input-icon" />
          <input 
            className="form-input input-with-icon" 
            placeholder="Search activity..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {isAdmin && (
          <button onClick={() => { setShowBroadcastModal(true); setErrors({}); }} className="btn btn-primary btn-sm">
            <Send size={16}/> Send Broadcast
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="stat-card" style={{ padding: 80, textAlign: 'center', opacity: 0.6 }}>
          <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3>No notifications</h3>
          <p>We'll notify you when things happen on the campus.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {filtered.map(n => {
            const config = typeConfig[n.type] || { icon: Bell, color: '#94A3B8', badge: 'badge-gray' }
            const Icon = config.icon

            return (
              <div 
                key={n.id} 
                className="stat-card" 
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '20px 24px', 
                  cursor: 'pointer',
                  opacity: n.read ? 0.75 : 1,
                  borderLeft: n.read ? '4px solid transparent' : `4px solid ${config.color}`,
                  background: '#fff',
                  flexDirection: 'row',
                  gap: 20,
                  alignItems: 'center'
                }}
              >
                <div className="stat-icon" style={{ 
                  width: 44, height: 44, 
                  background: n.read ? 'var(--bg-alt)' : `${config.color}15`,
                  flexShrink: 0 
                }}>
                  <Icon size={20} color={n.read ? 'var(--text-muted)' : config.color} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${config.badge}`} style={{ fontSize: 10 }}>
                      {n.type?.replace(/_/g,' ')}
                    </span>
                    {!n.read && <span className="notif-dot" style={{ position:'static', width:6, height:6 }} />}
                  </div>
                  
                  <p style={{ 
                    fontSize: 14, 
                    color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', 
                    fontWeight: n.read ? 400 : 600,
                    marginBottom: 2
                  }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <Calendar size={11}/>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   {n.referenceId && (
                     <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                       View <ArrowRight size={14}/>
                     </div>
                   )}
                   <div style={{ display: 'flex', gap: 4 }}>
                      {isAdmin && (n.type === 'SYSTEM_ALERT' || n.type === 'CRITICAL_ANNOUNCEMENT') && (
                        <button 
                          onClick={(e) => { 
                             e.stopPropagation(); 
                             setBroadcastMsg(n.message); 
                             setEditingBroadcastId(n.broadcastId || n.id); 
                             setErrors({});
                             setShowBroadcastModal(true); 
                           }} 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: 6, color: 'var(--primary)' }}
                          title="Edit Broadcast"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {!n.read && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }} 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: 6, color: 'var(--success)' }}
                        title="Mark Read"
                      >
                        <Check size={16} />
                      </button>
                     )}
                     <button 
                        onClick={(e) => handleDelete(e, n.id)} 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: 6, color: 'var(--danger)' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBroadcastId ? 'Edit Broadcast' : 'Send Broadcast Announcement'}</h3>
              <button onClick={() => { setShowBroadcastModal(false); setEditingBroadcastId(null); setBroadcastMsg(''); }} className="btn btn-ghost btn-icon"><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Announcement Message</label>
                <textarea 
                  className={`form-textarea ${errors.broadcastMsg ? 'error' : ''}`} 
                  value={broadcastMsg} 
                  onChange={e => { setBroadcastMsg(e.target.value); if(errors.broadcastMsg) setErrors(err=>({...err, broadcastMsg:null})) }} 
                  placeholder="Enter the message to send to all users..."
                  rows={4}
                />
                {errors.broadcastMsg && <div className="form-error-msg">{errors.broadcastMsg}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowBroadcastModal(false); setEditingBroadcastId(null); setBroadcastMsg(''); }} className="btn btn-outline">Cancel</button>
              <button onClick={handleSendBroadcast} className="btn btn-primary" disabled={broadcasting}>
                {broadcasting ? <div className="spinner" /> : <>{editingBroadcastId ? <Check size={16}/> : <Send size={16}/>} {editingBroadcastId ? 'Save Changes' : 'Send Broadcast'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
