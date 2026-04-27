import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Contact', href: '#footer' },
  ]

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <nav style={{
      ...styles.nav,
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
      borderBottom: scrolled ? '1px solid #E5E7EB' : 'none',
    }}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <Zap size={24} color="#87CEEB" fill="#87CEEB" />
          <span style={styles.logoText}>Smart Campus</span>
        </div>

        {!isAuthPage && (
          <>
            <div style={styles.desktopLinks}>
              {navLinks.map(link => (
                <a key={link.label} href={link.href} style={styles.link}>{link.label}</a>
              ))}
            </div>

            <div style={styles.actions}>
              <button onClick={() => navigate('/login')} className="btn btn-ghost">Log in</button>
              <button onClick={() => navigate('/signup')} className="btn btn-primary btn-sm">Sign Up</button>
              <div style={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>{link.label}</a>
          ))}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="btn btn-ghost">Log in</button>
            <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="btn btn-primary">Sign Up</button>
          </div>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '72px',
    zIndex: 1000,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: '#374151',
    fontFamily: 'var(--font-display)',
  },
  desktopLinks: {
    display: 'flex',
    gap: '32px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    '@media (max-width: 968px)': { display: 'none' },
  },
  link: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#374151',
    textDecoration: 'none',
    transition: 'color 0.2s',
    opacity: 0.8,
    ':hover': { color: '#B794F4', opacity: 1 },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mobileToggle: {
    display: 'none',
    cursor: 'pointer',
    padding: '8px',
    '@media (max-width: 968px)': { display: 'block' },
  },
  mobileMenu: {
    position: 'absolute',
    top: '72px',
    left: 0,
    right: 0,
    background: 'white',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
  },
  mobileLink: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    textDecoration: 'none',
    borderBottom: '1px solid #F9FAFB',
  },
}
