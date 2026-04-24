import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingsAPI } from '../../api/bookings'
import { ticketsAPI } from '../../api/tickets'
import { notificationsAPI } from '../../api/notifications'
import {
  CalendarCheck, Wrench, Clock, Bell, ChevronRight,
  PlusCircle, TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react'

const statusColor = {
  PENDING:   { bg: '#FFF9E6', color: '#D97706', label: 'Pending' },
  APPROVED:  { bg: '#EEFAF5', color: '#059669', label: 'Approved' },
  REJECTED:  { bg: '#FEF2F2', color: '#DC2626', label: 'Rejected' },
  CANCELLED: { bg: '#F1F5F9', color: '#64748B', label: 'Cancelled' },
  OPEN:      { bg: '#EEF2FF', color: '#4F46E5', label: 'Open' },
  IN_PROGRESS:{ bg: '#FFF9E6', color: '#D97706', label: 'In Progress' },
  RESOLVED:  { bg: '#EEFAF5', color: '#059669', label: 'Resolved' },
  CLOSED:    { bg: '#F1F5F9', color: '#64748B', label: 'Closed' },
}

function StatusBadge({ status }) {
  const s = statusColor[status] || { bg: '#F1F5F9', color: '#64748B', label: status }
  return (
    <span style={{ ...badge, background: s.bg, color: s.color }}>{s.label}</span>
  )
}
const badge = { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingsAPI.getAll().catch(() => []),
      ticketsAPI.getAll().catch(() => []),
      notificationsAPI.getAll().catch(() => []),
    ]).then(([b, t, n]) => {
      setBookings(b || [])
      setTickets(t || [])
      setNotifications((n || []).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
  const activeTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentTickets = [...tickets].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5)
  const upcomingBookings = bookings.filter(b => b.status === 'APPROVED' && new Date(b.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).slice(0, 5)

  if (loading) return <div style={s.loading}>Loading dashboard...</div>

  return (
    <div style={s.container}>
      {/* Welcome Banner */}
      <div style={s.banner}>
        <div style={s.bannerDeco1} /><div style={s.bannerDeco2} />
        <div style={s.bannerContent}>
          <div>
            <h1 style={s.bannerTitle}>Hello, {user?.name?.split(' ')[0]}!</h1>
            <p style={s.bannerSub}>Here's what's happening with your campus activities today.</p>
          </div>
          <button style={s.bannerBtn} onClick={() => navigate('/bookings')}>
            <PlusCircle size={18} /> New Booking
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Bookings', value: totalBookings, icon: CalendarCheck, color: '#76C8C8', bg: '#E0F7F7' },
          { label: 'Pending Bookings', value: pendingBookings, icon: Clock, color: '#F59E0B', bg: '#FEF9E7' },
          { label: 'Active Tickets', value: activeTickets, icon: Wrench, color: '#B794F4', bg: '#F3EEFF' },
        ].map(card => (
          <div key={card.label} style={s.statCard}>
            <div style={{ ...s.statIcon, background: card.bg }}>
              <card.icon size={22} color={card.color} />
            </div>
            <div>
              <div style={s.statValue}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.mainGrid}>
        {/* Left Column */}
        <div style={s.leftCol}>
          {/* Upcoming Bookings */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Upcoming Bookings</h3>
              <button style={s.viewAll} onClick={() => navigate('/bookings')}>View all <ChevronRight size={14} /></button>
            </div>
            {upcomingBookings.length === 0
              ? <div style={s.empty}>No upcoming approved bookings.</div>
              : upcomingBookings.map(b => (
                <div key={b.id} style={s.listItem}>
                  <div style={{ ...s.listIcon, background: '#E0F7F7' }}><CalendarCheck size={18} color="#76C8C8" /></div>
                  <div style={s.listContent}>
                    <div style={s.listTitle}>{b.resourceName || 'Resource'}</div>
                    <div style={s.listSub}>{new Date(b.startTime).toLocaleString()} – {new Date(b.endTime).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            }
          </div>

          {/* Recent Bookings */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Recent Bookings</h3>
              <button style={s.viewAll} onClick={() => navigate('/bookings')}>View all <ChevronRight size={14} /></button>
            </div>
            {recentBookings.length === 0
              ? <div style={s.empty}>No bookings yet.</div>
              : recentBookings.map(b => (
                <div key={b.id} style={s.listItem}>
                  <div style={{ ...s.listIcon, background: '#F3EEFF' }}><TrendingUp size={18} color="#B794F4" /></div>
                  <div style={s.listContent}>
                    <div style={s.listTitle}>{b.resourceName || 'Resource'}</div>
                    <div style={s.listSub}>{b.purpose || 'Booking'}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            }
          </div>
        </div>

        {/* Right Column */}
        <div style={s.rightCol}>
          {/* Active Tickets */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Recent Tickets</h3>
              <button style={s.viewAll} onClick={() => navigate('/tickets')}>View all <ChevronRight size={14} /></button>
            </div>
            {recentTickets.length === 0
              ? <div style={s.empty}>No tickets submitted.</div>
              : recentTickets.map(t => (
                <div key={t.id} style={s.listItem}>
                  <div style={{ ...s.listIcon, background: '#FEF9E7' }}><Wrench size={18} color="#F59E0B" /></div>
                  <div style={s.listContent}>
                    <div style={s.listTitle}>{t.title}</div>
                    <div style={s.listSub}>{t.priority} Priority</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))
            }
          </div>

          {/* Notifications */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Notifications</h3>
              <button style={s.viewAll} onClick={() => navigate('/notifications')}>View all <ChevronRight size={14} /></button>
            </div>
            {notifications.length === 0
              ? <div style={s.empty}>No new notifications.</div>
              : notifications.map(n => (
                <div key={n.id} style={s.notifItem}>
                  <div style={{ ...s.listIcon, background: n.read ? '#F1F5F9' : '#EEF2FF' }}>
                    <Bell size={16} color={n.read ? '#94A3B8' : '#4F46E5'} />
                  </div>
                  <div style={s.listContent}>
                    <div style={{ ...s.listTitle, fontWeight: n.read ? 500 : 700 }}>{n.message}</div>
                    <div style={s.listSub}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', gap: 24 },
  loading: { padding: 48, textAlign: 'center', color: 'var(--text-secondary)' },
  banner: { background: '#A78BFA', borderRadius: 20, padding: '28px 40px', position: 'relative', overflow: 'hidden' },
  bannerDeco1: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' },
  bannerDeco2: { position: 'absolute', bottom: -60, right: 80, width: 220, height: 220, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' },
  bannerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 },
  bannerTitle: { fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 400 },
  bannerBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#fff', border: 'none', borderRadius: 12, color: '#7C3AED', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  statCard: { background: '#fff', borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' },
  statIcon: { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  viewAll: { background: 'none', border: 'none', color: '#76C8C8', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },
  listItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F8FAFC' },
  notifItem: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: '1px solid #F8FAFC' },
  listIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listContent: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listSub: { fontSize: 12, color: 'var(--text-secondary)' },
  empty: { textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 14 },
}
