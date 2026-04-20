import React from 'react'

const Dashboard = () => {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time overview of campus operations and resource status.</p>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1), transparent)' }}>
          <div className="stat-label">Total Resources</div>
          <div className="stat-value">24</div>
          <div className="text-teal text-xs mt-2 font-bold">18 Available Now</div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), transparent)' }}>
          <div className="stat-label">Active Bookings</div>
          <div className="stat-value">12</div>
          <div className="text-secondary text-xs mt-2">Next: 2 PM (Conf. Room A)</div>
        </div>
        <div className="glass-card stat-card" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), transparent)' }}>
          <div className="stat-label">Pending Tickets</div>
          <div className="stat-value">05</div>
          <div className="text-coral text-xs mt-2 font-bold">2 Critical Priority</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', minHeight: '300px' }}>
        <h3 className="mb-4">Recent Activity</h3>
        <div className="empty-state">
          <div className="empty-state-title">No recent activity</div>
          <div className="empty-state-desc">New updates and system logs will appear here.</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
