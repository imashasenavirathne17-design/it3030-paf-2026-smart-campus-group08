import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  MdDashboard, 
  MdBusiness, 
  MdEventNote, 
  MdReportProblem, 
  MdNotifications, 
  MdLogout, 
  MdSearch,
  MdAdd
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import notificationService from '../services/notificationService'

const MainLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(res.data.count)
      } catch (err) {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard size={20} /> },
    { name: 'Facilities', path: '/assets', icon: <MdBusiness size={20} /> },
    { name: 'Bookings', path: '/bookings', icon: <MdEventNote size={20} /> },
    { name: 'Incidents', path: '/tickets', icon: <MdReportProblem size={20} /> },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex" style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 'var(--sidebar-width)', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}>
        {/* Profile Section */}
        <div style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <img 
              src={user?.picture || 'https://via.placeholder.com/48'} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--bg-app)' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {user?.name || 'User Name'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'user@campus.edu'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '2rem 1rem' }}>
          <p style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '1rem', 
            paddingLeft: '0.5rem' 
          }}>
            Application
          </p>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}>
            <MdLogout size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: 'var(--sidebar-width)', 
        padding: '1.5rem 2.5rem', 
        minHeight: '100vh' 
      }}>
        {/* Top Header */}
        <header style={{ 
          height: 'var(--topbar-height)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{getGreeting()},</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '-2px' }}>
              {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
              <MdSearch className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            <Link to="/notifications" className="icon-btn">
              <MdNotifications size={22} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </Link>

            <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}>
              <MdAdd size={20} />
              <span>Add New</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-fade">
          <Outlet />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 0.4rem;
          transition: all var(--transition);
        }
        .nav-item:hover {
          background-color: var(--bg-app);
          color: var(--primary);
        }
        .nav-item.active {
          background-color: rgba(139, 92, 246, 0.08);
          color: var(--primary);
          font-weight: 600;
        }
        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
        }
        .search-container {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.5rem 1rem;
          width: 260px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-container.focused {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
          width: 320px;
        }
        .search-container input {
          border: none;
          outline: none;
          background: transparent;
          margin-left: 0.5rem;
          width: 100%;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .search-icon { color: var(--text-muted); }
        .icon-btn {
          position: relative;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          transition: all var(--transition);
          background: #ffffff;
          border: 1px solid var(--border);
          text-decoration: none;
        }
        .icon-btn:hover {
          background: var(--bg-app);
          color: var(--primary);
          border-color: var(--primary);
        }
        .notification-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid #fff;
        }
      `}} />
    </div>
  )
}

export default MainLayout
