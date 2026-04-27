import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Settings, ChevronRight, CalendarCheck, Wrench, Check, ShieldCheck, History, X } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import PreferencesModal from '../PreferencesModal'
import { bookingsAPI } from '../../api/bookings'
import { ticketsAPI } from '../../api/tickets'
import { notificationsAPI } from '../../api/notifications'

export default function RightPanel() {
  const { user } = useAuth()
  const [showPrefs, setShowPrefs] = useState(false)
  const [myBookings, setMyBookings] = useState([])
  const [myTickets, setMyTickets] = useState([])
  const [myNotifications, setMyNotifications] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      bookingsAPI.getAll().catch(() => []),
      ticketsAPI.getAll().catch(() => []),
      notificationsAPI.getAll().catch(() => [])
    ]).then(([b, t, n]) => {
      setMyBookings((b || []).filter(item => item.userId === user.id))
      setMyTickets((t || []).filter(item => item.submittedById === user.id))
      setMyNotifications(n || [])
    })
  }, [user])

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setMyNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const eventCount = myBookings.length
  const ticketCount = myTickets.length

  const reminders = []
  
  const upcomingBookings = myBookings
    .filter(b => b.status === 'APPROVED' && new Date(b.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  if (upcomingBookings.length > 0) {
    const b = upcomingBookings[0]
    reminders.push({ 
      title: 'Room Booking', 
      time: `${b.resourceName || 'Resource'} • ${new Date(b.startTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}`, 
      icon: CalendarCheck, 
      color: '#76C8C8' 
    })
  }

  const activeTickets = myTickets
    .filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if (activeTickets.length > 0) {
    const t = activeTickets[0]
    reminders.push({ 
      title: 'Maintenance', 
      time: `${t.title} • ${t.status === 'IN_PROGRESS' ? 'In Progress' : 'Open'}`, 
      icon: Wrench, 
      color: '#B794F4' 
    })
  }

  const unreadNotifs = myNotifications
    .filter(n => !n.read)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (unreadNotifs.length > 0) {
    const n = unreadNotifs[0]
    reminders.push({ 
      title: 'System Alert', 
      time: `${n.message}`, 
      icon: Bell, 
      color: '#FBBF24' 
    })
  }

  return (
    <>
    <aside style={styles.panel}>
      {/* Profile Summary */}
      <div style={styles.profile}>
        <img
          src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E0F2F2&color=76C8C8`}
          alt={user?.name} style={styles.avatar}
        />
        <h3 style={styles.userName}>{user?.name}</h3>
        <p style={styles.userEmail}>{user?.email}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <span style={styles.roleBadge}>{user?.role}</span>
          <button 
            onClick={() => setShowHistory(true)}
            style={{ ...styles.roleBadge, background: 'var(--bg-alt)', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            title="View login history"
          >
            <History size={12} /> History
          </button>
        </div>
        
        <div style={styles.stats}>
          <div style={styles.statItem}><div style={styles.statLabel}>Level</div><div style={styles.statVal}>A+</div></div>
          <div style={styles.statItem}><div style={styles.statLabel}>Events</div><div style={styles.statVal}>{eventCount < 10 ? `0${eventCount}` : eventCount}</div></div>
          <div style={styles.statItem}><div style={styles.statLabel}>Tickets</div><div style={styles.statVal}>{ticketCount < 10 ? `0${ticketCount}` : ticketCount}</div></div>
        </div>
      </div>

      {/* Recent Results / Activity */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Upcoming Reminders</h4>
          <ChevronRight size={16} color="var(--text-secondary)" />
        </div>
        <div style={styles.list}>
          {reminders.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>No upcoming reminders.</div>
          ) : (
            reminders.map((r, i) => (
              <div key={i} style={styles.listItem}>
                <div style={{ ...styles.iconBox, background: `${r.color}20` }}>
                  <r.icon size={18} color={r.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.itemTitle}>{r.title}</div>
                  <div style={{...styles.itemTime, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={r.time}>{r.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Recent Notifications</h4>
          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>{unreadNotifs.length} NEW</span>
        </div>
        <div style={{ ...styles.list, maxHeight: 250, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
          {myNotifications.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>No activity.</div>
          ) : (
            myNotifications.slice(0, 5).map((n) => (
              <div key={n.id} style={{ ...styles.listItem, opacity: n.read ? 0.6 : 1, position: 'relative' }}>
                <div style={{ ...styles.iconBox, background: n.read ? 'var(--bg-alt)' : '#B794F420' }}>
                  <Bell size={16} color={n.read ? 'var(--text-muted)' : '#B794F4'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...styles.itemTitle, fontSize: 13 }}>{n.message}</div>
                  <div style={styles.itemTime}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} style={styles.readBtn} title="Mark as read">
                    <Check size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Settings */}
      <div style={styles.section}>
        <button style={styles.settingsBtn} onClick={() => setShowHistory(true)}>
          <div style={{ ...styles.iconBox, width: 32, height: 32, background: '#FEE2E2', borderRadius: 8 }}>
            <ShieldCheck size={18} color="#EF4444" />
          </div>
          <span style={{ flex: 1, textAlign: 'left' }}>Security & Login History</span>
          <ChevronRight size={16} style={{ opacity: 0.5 }} />
        </button>
      </div>

      <div style={{ ...styles.section, marginTop: 'auto' }}>
        <button style={styles.settingsBtn} onClick={() => setShowPrefs(true)}>
          <Settings size={20} />
          <span>Profile Preferences</span>
        </button>
      </div>
    </aside>

    {showHistory && (
      <div className="modal-overlay" onClick={() => setShowHistory(false)}>
        <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color="#EF4444" />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Security Activity</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Recent logins for your account</p>
              </div>
            </div>
            <button onClick={() => setShowHistory(false)} className="btn btn-ghost btn-icon"><X size={18}/></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }} className="custom-scrollbar">
              {(!user?.loginHistory || user.loginHistory.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>No history available.</div>
              ) : (
                user.loginHistory.slice().reverse().map((event, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-alt)', borderRadius: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: event.status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Login via {event.provider}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: event.status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)' }}>
                      {event.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={() => setShowHistory(false)} className="btn btn-primary" style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      </div>
    )}
    {showPrefs && <PreferencesModal onClose={() => setShowPrefs(false)} />}
    </>
  )
}

const styles = {
  panel: {
    width: 'var(--right-panel-width)',
    height: '100vh',
    background: '#FFFFFF',
    borderLeft: '1px solid var(--border)',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0, right: 0, bottom: 0,
    zIndex: 100,
  },
  profile: { textAlign: 'center', marginBottom: 40 },
  avatar: { width: 90, height: 90, borderRadius: 'var(--radius-lg)', objectFit: 'cover', marginBottom: 16, border: '4px solid #F4F7F9' },
  userName: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 },
  roleBadge: { 
    display: 'inline-flex', padding: '4px 10px', borderRadius: '8px', 
    background: 'var(--primary-light)', color: 'var(--primary-dark)',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.5px'
  },
  stats: { 
    display: 'flex', justifyContent: 'space-between', padding: '16px', 
    background: '#F8FAFC', borderRadius: 'var(--radius)', border: '1px solid #F1F5F9' 
  },
  statItem: { textAlign: 'center' },
  statLabel: { fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  section: { marginBottom: 32 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  listItem: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  itemTime: { fontSize: 12, color: 'var(--text-secondary)' },
  settingsBtn: {
    width: '100%', padding: '14px', borderRadius: 'var(--radius)', 
    background: '#F4F7F9', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', transition: 'var(--transition)'
  },
  readBtn: {
    border: 'none', background: 'var(--bg-alt)', width: 24, height: 24, 
    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--success)', marginLeft: 8
  }
}
