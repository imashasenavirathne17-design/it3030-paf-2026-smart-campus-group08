import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Menu, Building2, CalendarCheck, Wrench,
  Bell, LogOut, Zap, Home, Heart, Calendar, User, Users
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     icon: Home,             label: 'Home' },
  { to: '/resources',     icon: Building2,        label: 'Facilities' },
  { to: '/bookings',      icon: Calendar,         label: 'Schedule' },
  { to: '/tickets',       icon: Wrench,           label: 'Support' },
  { to: '/notifications', icon: Bell,             label: 'Alerts' },
]

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside style={{ ...styles.sidebar, width: isOpen ? 240 : 'var(--sidebar-width)' }}>
      {/* Menu Toggle */}
      <div style={styles.logo} onClick={toggleSidebar}>
        <div style={styles.logoIcon}>
           <Menu size={20} color="#fff" />
        </div>
        {isOpen && <div style={styles.logoText}>Menu</div>}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            ...styles.navItem,
            width: isOpen ? '100%' : 54,
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: isOpen ? '0 20px' : 0,
            ...(isActive ? styles.navItemActive : {})
          })} title={label}>
            <Icon size={22} />
            {isOpen && <span style={styles.navLabel}>{label}</span>}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" style={({ isActive }) => ({
            ...styles.navItem,
            width: isOpen ? '100%' : 54,
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: isOpen ? '0 20px' : 0,
            ...(isActive ? styles.navItemActive : {})
          })} title="User Management">
            <Users size={22} />
            {isOpen && <span style={styles.navLabel}>Users</span>}
          </NavLink>
        )}
      </nav>

      {/* Bottom Actions */}
      <div style={styles.bottom}>
        <button onClick={handleLogout} style={{
          ...styles.logoutBtn,
          flexDirection: isOpen ? 'row' : 'column',
          width: isOpen ? '100%' : 'auto',
          padding: isOpen ? '12px 20px' : 0,
          background: isOpen ? 'rgba(255,255,255,0.05)' : 'none',
          borderRadius: isOpen ? '12px' : 0,
        }}>
          <LogOut size={20} />
          {isOpen && <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 12 }}>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    minHeight: '100vh', 
    background: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    padding: '32px 16px', 
    position: 'fixed',
    top: 0, left: 0, bottom: 0, zIndex: 100,
    borderTopRightRadius: 'var(--radius-lg)',
    borderBottomRightRadius: 'var(--radius-lg)',
    boxShadow: '10px 0 30px rgba(118, 200, 200, 0.2)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 60, cursor: 'pointer', width: '100%',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  logoText: { color: '#fff', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
  nav:      { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', alignItems: 'center' },
  navItem:  {
    display: 'flex', alignItems: 'center',
    height: 54, borderRadius: '16px',
    color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'var(--transition)',
    overflow: 'hidden',
  },
  navLabel: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff', 
    boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  bottom: { marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' },
  logoutBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.8)', display: 'flex', 
    alignItems: 'center', gap: 4, transition: 'var(--transition)',
  },
}
