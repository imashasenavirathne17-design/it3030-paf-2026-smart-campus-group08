import React, { useState, useEffect } from 'react'
import { MdTrendingUp, MdEventAvailable, MdReportProblem, MdNotificationsActive, MdDashboard } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import bookingService from '../services/bookingService'
import ticketService from '../services/ticketService'
import notificationService from '../services/notificationService'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    bookings: 0,
    tickets: 0,
    notifications: 0,
    activeAlerts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bRes, tRes, nCountRes] = await Promise.all([
          bookingService.getMyBookings(),
          ticketService.getMyTickets(),
          notificationService.getUnreadCount()
        ])
        setStats({
          bookings: bRes.data.length,
          tickets: tRes.data.length,
          notifications: nCountRes.data.count,
          activeAlerts: tRes.data.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
        })
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card stat-card" style={{ padding: '24px' }}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest">{title}</p>
          <h2 className="text-3xl font-black mt-1" style={{ color: `rgb(${color})` }}>{value}</h2>
        </div>
        <div style={{ 
          width: '52px', height: '52px', 
          background: `rgba(${color}, 0.1)`, 
          borderRadius: '14px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', color: `rgb(${color})`
        }}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 text-xs font-bold" style={{ color: `rgba(${color}, 0.6)` }}>
        <MdTrendingUp />
        <span>+12% from last week</span>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">Here's a real-time overview of your Smart Campus activities.</p>
        </div>
        <div className="badge badge-teal" style={{ padding: '8px 16px' }}>
          {format(new Date(), 'EEEE, MMMM do')}
        </div>
      </div>

      <div className="stats-grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="My Bookings" value={stats.bookings} icon={<MdEventAvailable />} color="20, 184, 166" />
        <StatCard title="Active Tickets" value={stats.activeAlerts} icon={<MdReportProblem />} color="244, 63, 94" />
        <StatCard title="Unread Notifications" value={stats.notifications} icon={<MdNotificationsActive />} color="245, 158, 11" />
        <StatCard title="Campus Health" value="98%" icon={<MdDashboard />} color="99, 102, 241" />
      </div>

      <div className="flex gap-6 md-flex-row flex-direction-column">
        {/* Main Analytics View */}
        <div className="glass-card" style={{ padding: '32px', flex: 2 }}>
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold">Campus Hub Usage</h3>
             <div className="flex gap-2">
               <div className="badge badge-teal">Weekly</div>
               <div className="badge badge-gray">Monthly</div>
             </div>
          </div>
          
          <div className="flex items-end gap-3" style={{ height: '220px' }}>
             {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
               <div key={i} style={{ 
                 flex: 1, 
                 height: `${h}%`, 
                 background: i === 6 ? 'var(--teal-500)' : 'rgba(20, 184, 166, 0.2)',
                 borderRadius: '8px 8px 4px 4px',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer'
               }} className="bar-hover" />
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted font-bold">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="flex flex-direction-column gap-6" style={{ flex: 1 }}>
           <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-direction-column gap-3">
                 <button className="btn btn-primary w-full text-left" style={{ justifyContent: 'start' }}>New Booking</button>
                 <button className="btn btn-ghost w-full text-left" style={{ justifyContent: 'start', border: '1px solid var(--border)' }}>Report Incident</button>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(20,184,166,0.1), transparent)' }}>
              <p className="text-xs font-bold text-teal uppercase tracking-widest mb-2">Did you know?</p>
              <p className="text-sm text-secondary leading-relaxed">
                You can access facilities using the QR code generated once your booking is approved. 
                View it in the <span className="text-teal font-bold">Bookings</span> section.
              </p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bar-hover:hover { background: var(--teal-400) !important; transform: scaleY(1.05); }
      `}} />
    </div>
  )
}

export default Dashboard
