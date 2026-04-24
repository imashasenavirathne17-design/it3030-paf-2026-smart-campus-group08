import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingsAPI } from '../../api/bookings'
import { ticketsAPI } from '../../api/tickets'
import { notificationsAPI, dashboardAPI } from '../../api/notifications'
import {
  Building2, CalendarCheck, Wrench, Bell, ChevronRight,
  AlertTriangle, Users, BarChart2, CheckCircle, Clock, Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const statusColor = {
  PENDING:    { bg: '#FFF9E6', color: '#D97706', label: 'Pending' },
  APPROVED:   { bg: '#EEFAF5', color: '#059669', label: 'Approved' },
  REJECTED:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rejected' },
  CANCELLED:  { bg: '#F1F5F9', color: '#64748B', label: 'Cancelled' },
  OPEN:       { bg: '#EEF2FF', color: '#4F46E5', label: 'Open' },
  IN_PROGRESS:{ bg: '#FFF9E6', color: '#D97706', label: 'In Progress' },
  RESOLVED:   { bg: '#EEFAF5', color: '#059669', label: 'Resolved' },
  CLOSED:     { bg: '#F1F5F9', color: '#64748B', label: 'Closed' },
}

function StatusBadge({ status }) {
  const st = statusColor[status] || { bg: '#F1F5F9', color: '#64748B', label: status }
  return <span style={{ ...badge, background: st.bg, color: st.color }}>{st.label}</span>
}
const badge = { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats().catch(() => null),
      bookingsAPI.getAll().catch(() => []),
      ticketsAPI.getAll().catch(() => []),
      notificationsAPI.getAll().catch(() => []),
    ]).then(([st, b, t, n]) => {
      setStats(st)
      setBookings(b || [])
      setTickets(t || [])
      setNotifications((n || []).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const totalResources = stats?.totalResources || 0
  const totalBookings = bookings.length
  const pendingApprovals = bookings.filter(b => b.status === 'PENDING').length
  const activeTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  const criticalTickets = tickets.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED')

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5)

  // Build bar chart data from booking status counts
  const bookingStatusData = Object.entries(
    bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const CHART_COLORS = ['#76C8C8', '#B794F4', '#FBBF24', '#F87171']

  if (loading) return <div style={s.loading}>Loading dashboard...</div>

  return (
    <div style={s.container}>
      {/* Welcome Banner */}
      <div style={s.banner}>
        <div style={s.bannerDeco1} /><div style={s.bannerDeco2} />
        <div style={s.bannerContent}>
          <div>
            <h1 style={s.bannerTitle}>Hello, {user?.name?.split(' ')[0]}!</h1>
            <p style={s.bannerSub}>Here's a complete overview of your Smart Campus system today.</p>
          </div>
          <div style={s.alertChip}>
            <AlertTriangle size={16} color="#FBBF24" />
            <span>{pendingApprovals} Pending Approval{pendingApprovals !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Resources', value: totalResources, icon: Building2, color: '#76C8C8', bg: '#E0F7F7', action: () => navigate('/resources') },
          { label: 'Total Bookings', value: totalBookings, icon: CalendarCheck, color: '#B794F4', bg: '#F3EEFF', action: () => navigate('/bookings') },
          { label: 'Active Tickets', value: activeTickets, icon: Wrench, color: '#F59E0B', bg: '#FEF9E7', action: () => navigate('/tickets') },
          { label: 'Pending Approvals', value: pendingApprovals, icon: Clock, color: '#EF4444', bg: '#FEF2F2', action: () => navigate('/bookings') },
        ].map(card => (
          <div key={card.label} style={s.statCard} onClick={card.action}>
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

      {/* Alerts for Critical Tickets */}
      {criticalTickets.length > 0 && (
        <div style={s.alertBanner}>
          <AlertTriangle size={20} color="#DC2626" />
          <strong style={{ color: '#DC2626' }}>{criticalTickets.length} Critical Ticket{criticalTickets.length > 1 ? 's' : ''} Require Attention:</strong>
          {criticalTickets.slice(0, 3).map(t => (
            <button key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={s.alertLink}>{t.title}</button>
          ))}
        </div>
      )}

      <div style={s.mainGrid}>
        {/* Booking Analytics Chart */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Booking Analytics</h3>
            <BarChart2 size={18} color="var(--text-secondary)" />
          </div>
          {bookingStatusData.length === 0
            ? <div style={s.empty}>No booking data yet.</div>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bookingStatusData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Notifications */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>System Notifications</h3>
            <button style={s.viewAll} onClick={() => navigate('/notifications')}>View all <ChevronRight size={14} /></button>
          </div>
          {notifications.length === 0
            ? <div style={s.empty}>No notifications.</div>
            : notifications.map(n => (
              <div key={n.id} style={s.listItem}>
                <div style={{ ...s.listIcon, background: n.read ? '#F1F5F9' : '#FEF2F2' }}>
                  <Bell size={16} color={n.read ? '#94A3B8' : '#EF4444'} />
                </div>
                <div style={s.listContent}>
                  <div style={{ ...s.listTitle, fontWeight: n.read ? 500 : 700 }}>{n.message}</div>
                  <div style={s.listSub}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Recent Bookings */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Recent Bookings</h3>
            <button style={s.viewAll} onClick={() => navigate('/bookings')}>Manage <ChevronRight size={14} /></button>
          </div>
          {recentBookings.length === 0
            ? <div style={s.empty}>No bookings yet.</div>
            : recentBookings.map(b => (
              <div key={b.id} style={s.listItem}>
                <div style={{ ...s.listIcon, background: '#E0F7F7' }}><CalendarCheck size={18} color="#76C8C8" /></div>
                <div style={s.listContent}>
                  <div style={s.listTitle}>{b.resourceName || 'Resource'}</div>
                  <div style={s.listSub}>{b.userName || 'User'} · {new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          }
        </div>

        {/* Recent Tickets */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Recent Tickets</h3>
            <button style={s.viewAll} onClick={() => navigate('/tickets')}>Manage <ChevronRight size={14} /></button>
          </div>
          {recentTickets.length === 0
            ? <div style={s.empty}>No tickets yet.</div>
            : recentTickets.map(t => (
              <div key={t.id} style={s.listItem} onClick={() => navigate(`/tickets/${t.id}`)}>
                <div style={{ ...s.listIcon, background: '#FEF9E7' }}><Wrench size={18} color="#F59E0B" /></div>
                <div style={s.listContent}>
                  <div style={s.listTitle}>{t.title}</div>
                  <div style={s.listSub}>{t.submittedByName || 'User'} · {t.priority} Priority</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))
          }
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
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  alertChip: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', color: '#7C3AED', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', cursor: 'default' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  statCard: { background: '#fff', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  statIcon: { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 },
  alertBanner: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 14 },
  alertLink: { background: 'none', border: '1px solid #FCA5A5', borderRadius: 8, padding: '4px 12px', color: '#DC2626', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  viewAll: { background: 'none', border: 'none', color: '#76C8C8', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },
  listItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F8FAFC', cursor: 'pointer' },
  listIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listContent: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listSub: { fontSize: 12, color: 'var(--text-secondary)' },
  empty: { textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 14 },
}
