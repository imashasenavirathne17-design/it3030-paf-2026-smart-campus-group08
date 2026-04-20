import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  MdDashboard, 
  MdBusiness, 
  MdEventNote, 
  MdReportProblem, 
  MdNotifications, 
  MdLogout, 
  MdPerson,
  MdWbSunny,
  MdNightlightRound
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import notificationService from '../services/notificationService'

const MainLayout = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(res.data.count)
      } catch (err) {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // Polling every 30s
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Facilities', path: '/assets', icon: <MdBusiness /> },
    { name: 'Bookings', path: '/bookings', icon: <MdEventNote /> },
    { name: 'Tickets', path: '/tickets', icon: <MdReportProblem /> },
  ]

  return (
    <div className="page-wrapper">
      {/* Sidebar */}
      <aside className="glass-card side-nav" style={{ 
        width: '260px', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0,
        borderRadius: 0,
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.5rem'
          }}>
            <MdBusiness />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              SMART CAMPUS
            </h1>
            <p style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>
              Operations Hub
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button onClick={toggleTheme} className="btn-ghost w-full justify-between" style={{ padding: '12px' }}>
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <MdWbSunny /> : <MdNightlightRound />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <button onClick={logout} className="btn-ghost w-full justify-between mt-4" style={{ padding: '12px', color: 'var(--coral-400)' }}>
            <span className="flex items-center gap-2">
              <MdLogout />
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-secondary text-sm font-bold uppercase tracking-wider">Welcome back,</h2>
            <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="btn-ghost" style={{ padding: '10px', borderRadius: '50%', position: 'relative' }}>
              <MdNotifications size={24} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '2px', right: '2px', 
                  background: 'var(--coral-500)', color: '#fff', 
                  fontSize: '0.6rem', fontWeight: 900,
                  width: '18px', height: '18px', 
                  borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3 glass-card" style={{ padding: '6px 16px', borderRadius: '99px' }}>
              <img 
                src={user?.picture || 'https://via.placeholder.com/32'} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span className="text-sm font-bold">{user?.roles?.[0]}</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .side-nav {
          transition: transform 0.3s ease;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 4px;
          transition: all var(--transition);
        }
        .nav-link:hover {
          background: rgba(20, 184, 166, 0.05);
          color: var(--teal-400);
        }
        .nav-link.active {
          background: rgba(20, 184, 166, 0.1);
          color: var(--teal-400);
          font-weight: 600;
        }
        .nav-icon {
          font-size: 1.25rem;
          opacity: 0.8;
        }
      `}} />
    </div>
  )
}

export default MainLayout
