import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ticketsAPI } from '../../api/tickets'
import { notificationsAPI } from '../../api/notifications'
import {
  Wrench, CheckCircle, Clock, Bell, ChevronRight,
  AlertTriangle, Activity, ListChecks, TrendingUp
} from 'lucide-react'

const statusColor = {
  OPEN:        { bg: '#EEF2FF', color: '#4F46E5', label: 'Open' },
  IN_PROGRESS: { bg: '#FFF9E6', color: '#D97706', label: 'In Progress' },
  RESOLVED:    { bg: '#EEFAF5', color: '#059669', label: 'Resolved' },
  CLOSED:      { bg: '#F1F5F9', color: '#64748B', label: 'Closed' },
}

const priorityColor = {
  HIGH:   { bg: '#FEF2F2', color: '#DC2626' },
  MEDIUM: { bg: '#FFF9E6', color: '#D97706' },
  LOW:    { bg: '#EEFAF5', color: '#059669' },
}

function StatusBadge({ status }) {
  const s = statusColor[status] || { bg: '#F1F5F9', color: '#64748B', label: status }
  return <span style={{ ...badge, background: s.bg, color: s.color }}>{s.label}</span>
}

function PriorityBadge({ priority }) {
  const p = priorityColor[priority] || { bg: '#F1F5F9', color: '#64748B' }
  return <span style={{ ...badge, background: p.bg, color: p.color }}>{priority}</span>
}

const badge = { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      ticketsAPI.getAll().catch(() => []),
      notificationsAPI.getAll().catch(() => []),
    ]).then(([t, n]) => {
      setTickets(t || [])
      setNotifications((n || []).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const assigned = tickets.length
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length
  const open = tickets.filter(t => t.status === 'OPEN').length

  const todayTasks = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
    .sort((a, b) => {
      const pOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1)
    }).slice(0, 8)

  const recentActivity = [...tickets]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5)

  if (loading) return <div style={s.loading}>Loading dashboard...</div>

  return (
    <div style={s.container}>
      {/* Welcome Banner */}
      <div style={s.banner}>
        <div style={s.bannerDeco1} /><div style={s.bannerDeco2} />
        <div style={s.bannerContent}>
          <div>
            <h1 style={s.bannerTitle}>Hello, {user?.name?.split(' ')[0]}!</h1>
            <p style={s.bannerSub}>
              You have <strong style={{ color: '#fff' }}>{open} open</strong> and{' '}
              <strong style={{ color: '#fff' }}>{inProgress} in-progress</strong> tickets today.
            </p>
          </div>
          <button style={s.bannerBtn} onClick={() => navigate('/tickets')}>
            <ListChecks size={18} /> View All Tickets
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.statsRow}>
        {[
          { label: 'Assigned Tickets', value: assigned, icon: Wrench, color: '#76C8C8', bg: '#E0F7F7' },
          { label: 'In Progress', value: inProgress, icon: Activity, color: '#F59E0B', bg: '#FEF9E7' },
          { label: 'Resolved', value: resolved, icon: CheckCircle, color: '#10B981', bg: '#EEFAF5' },
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
        {/* Today's Tasks */}
        <div style={{ ...s.card, gridColumn: '1 / -1' }}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Today's Tasks (Active Tickets)</h3>
            <button style={s.viewAll} onClick={() => navigate('/tickets')}>Manage all <ChevronRight size={14} /></button>
          </div>
          {todayTasks.length === 0
            ? <div style={s.empty}>No open or in-progress tickets. Great work! 🎉</div>
            : <div style={s.taskGrid}>
                {todayTasks.map(t => (
                  <div key={t.id} style={s.taskCard} onClick={() => navigate(`/tickets/${t.id}`)}>
                    <div style={s.taskHeader}>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <div style={s.taskTitle}>{t.title}</div>
                    <div style={s.taskMeta}>{t.location || 'No location'}</div>
                    <div style={s.taskTime}>{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Recent Activity */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Recent Updates</h3>
          </div>
          {recentActivity.length === 0
            ? <div style={s.empty}>No recent activity.</div>
            : recentActivity.map(t => (
              <div key={t.id} style={s.listItem}>
                <div style={{ ...s.listIcon, background: statusColor[t.status]?.bg || '#F1F5F9' }}>
                  <Wrench size={18} color={statusColor[t.status]?.color || '#64748B'} />
                </div>
                <div style={s.listContent}>
                  <div style={s.listTitle}>{t.title}</div>
                  <div style={s.listSub}>Updated: {new Date(t.updatedAt || t.createdAt).toLocaleString()}</div>
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
              <div key={n.id} style={s.listItem}>
                <div style={{ ...s.listIcon, background: n.read ? '#F1F5F9' : '#FEF9E7' }}>
                  <Bell size={16} color={n.read ? '#94A3B8' : '#F59E0B'} />
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
  statCard: { background: '#fff', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' },
  statIcon: { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  viewAll: { background: 'none', border: 'none', color: '#76C8C8', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  taskCard: { background: '#F8FAFC', borderRadius: 16, padding: 16, cursor: 'pointer', border: '1px solid #F1F5F9', transition: 'box-shadow 0.2s' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  taskTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 },
  taskMeta: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  taskTime: { fontSize: 11, color: '#94A3B8' },
  listItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F8FAFC' },
  listIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listContent: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listSub: { fontSize: 12, color: 'var(--text-secondary)' },
  empty: { textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 14 },
}
