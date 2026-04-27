import { useLocation } from 'react-router-dom'
import { Bell, Search, PanelRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { notificationsAPI } from '../../api/notifications'

export default function Topbar({ toggleRightPanel }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    notificationsAPI.getUnreadCount().then(d => setUnread(d.count || 0)).catch(() => {})
  }, [user])

  const firstName = user?.name?.split(' ')[0] || 'User'

  return (
    <header style={styles.topbar}>
      <div style={styles.greeting}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Hello, {firstName}!</h2>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>
        <p style={styles.date}>{new Date().toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric', weekday:'long' })}</p>
      </div>

      <div style={styles.searchWrap}>
        <Search size={18} style={styles.searchIcon} />
        <input style={styles.search} placeholder="Search anything..." />
      </div>

      <div style={styles.actions}>
        <button style={styles.iconBtn} onClick={toggleRightPanel} title="Notifications & Profile">
          <Bell size={22} />
          {unread > 0 && <span style={styles.badge} />}
        </button>
        <button style={styles.iconBtn} onClick={toggleRightPanel} title="Toggle Profile Panel">
          <PanelRight size={22} />
        </button>
      </div>
    </header>
  )
}

const styles = {
  topbar: {
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    background: 'transparent',
  },
  greeting: { flex: 1 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 },
  title: { fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' },
  roleBadge: { 
    fontSize: 10, fontWeight: 800, background: 'rgba(118, 200, 200, 0.15)', 
    color: '#76C8C8', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.05em' 
  },
  date: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 },
  searchWrap: { 
    position: 'relative', 
    flex: 1, 
    maxWidth: 400,
    margin: '0 40px'
  },
  searchIcon: { 
    position: 'absolute', 
    left: 20, 
    top: '50%', 
    transform: 'translateY(-50%)',
    color: '#CBD5E1' 
  },
  search: {
    width: '100%',
    padding: '14px 20px 14px 54px',
    borderRadius: '16px',
    border: 'none',
    background: '#FFFFFF',
    fontSize: 14,
    color: 'var(--text-primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    outline: 'none',
    transition: 'var(--transition)',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 20 },
  iconBtn: {
    position: 'relative',
    background: '#FFFFFF',
    border: 'none',
    width: 48,
    height: 48,
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent)',
    border: '2px solid #fff',
  }
}
