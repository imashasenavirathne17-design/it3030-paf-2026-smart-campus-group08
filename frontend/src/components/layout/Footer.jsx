import { Zap, Globe, MessageCircle, Share2, Mail, MapPin, Phone } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  const currentYear = new Date().getFullYear()
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  if (isAuthPage) return null

  return (
    <footer id="footer" style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.brandCol}>
            <div style={styles.logo}>
              <Zap size={22} color="#87CEEB" fill="#87CEEB" />
              <span style={styles.logoText}>Smart Campus</span>
            </div>
            <p style={styles.brandDesc}>
              Streamlining university operations through intelligent resource management 
               and automated workflows.
            </p>
            <div style={styles.socials}>
              <a href="#" style={styles.socialLink}><Share2 size={20} /></a>
              <a href="#" style={styles.socialLink}><Globe size={20} /></a>
              <a href="#" style={styles.socialLink}><MessageCircle size={20} /></a>
            </div>
          </div>

          <div style={styles.linkCol}>
            <h4 style={styles.heading}>Product</h4>
            <a href="#features" style={styles.link}>Features</a>
            <a href="#solutions" style={styles.link}>Solutions</a>
            <a href="#" style={styles.link}>View Demo</a>
          </div>

          <div style={styles.linkCol}>
            <h4 style={styles.heading}>Company</h4>
            <a href="#" style={styles.link}>About</a>
            <a href="#" style={styles.link}>Contact</a>
            <a href="#" style={styles.link}>Privacy Policy</a>
          </div>

          <div style={styles.linkCol}>
            <h4 style={styles.heading}>Contact</h4>
            <div style={styles.contactItem}><MapPin size={16} /> University Way, SL</div>
            <div style={styles.contactItem}><Phone size={16} /> +94 11 234 5678</div>
            <div style={styles.contactItem}><Mail size={16} /> support@smartcampus.edu</div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p>© {currentYear} Smart Campus Hub. All rights reserved.</p>
          <div style={styles.bottomLinks}>
            <span>Built with ♥ for Higher Education</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: '#FFFFFF',
    borderTop: '1px solid #E5E7EB',
    padding: '80px 0 40px',
    color: '#9CA3AF',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
    gap: '64px',
    marginBottom: '64px',
    '@media (max-width: 968px)': {
      gridTemplateColumns: '1fr 1fr',
    }
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#374151',
    letterSpacing: '-0.025em',
  },
  brandDesc: {
    fontSize: '15px',
    lineHeight: 1.6,
    maxWidth: '280px',
  },
  socials: {
    display: 'flex',
    gap: '20px',
  },
  socialLink: {
    color: '#9CA3AF',
    transition: 'color 0.2s',
    ':hover': { color: '#B794F4' },
  },
  linkCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  heading: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  link: {
    fontSize: '15px',
    color: '#9CA3AF',
    textDecoration: 'none',
    transition: 'color 0.2s',
    ':hover': { color: '#374151' },
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
  },
  bottom: {
    paddingTop: '32px',
    borderTop: '1px solid #F3F4F6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  bottomLinks: {
    fontSize: '14px',
    fontWeight: 500,
  }
}
