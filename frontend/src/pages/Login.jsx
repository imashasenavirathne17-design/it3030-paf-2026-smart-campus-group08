import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.authWrapper}>
        {/* Visual Side */}
        <div style={styles.visualSide}>
          <div style={styles.visualContent}>
            <div style={styles.badge}>
              <Sparkles size={14} /> Higher Education OS
            </div>
            <h1 style={styles.visualTitle}>
              Welcome back to <br/>
              <span style={{ color: '#87CEEB' }}>Smart Campus</span>
            </h1>
            <p style={styles.visualSub}>
              Access your unified command center for campus resources, 
              scheduling, and maintenance tracking.
            </p>

            <div style={styles.featureList}>
              {[
                { icon: Building2, text: 'Real-time resource availability' },
                { icon: ShieldCheck, text: 'Secure role-based access' },
                { icon: Zap, text: 'Instant status notifications' }
              ].map((item, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={styles.featureIcon}>
                    <item.icon size={20} color="#87CEEB" />
                  </div>
                  <span style={styles.featureText}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.visualFooter}>
            <p>© 2026 Smart Campus Hub. Version 4.2.0</p>
          </div>
        </div>

        {/* Form Side */}
        <div style={styles.formSide}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Sign In</h2>
              <p style={styles.formSub}>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    className="form-input input-with-icon"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label">Password</label>
                  <a href="#" style={styles.forgotPass}>Forgot password?</a>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="form-input input-with-icon"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-action-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ChevronRight size={18} />
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerText}>or continue with</span>
            </div>

            <GoogleLoginButton text="signin_with" width="400" />

            <p style={styles.footerText}>
              Don't have an account? <span onClick={() => navigate('/signup')} style={styles.linkText}>Create an account</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  },
  authWrapper: {
    display: 'flex',
    flex: 1,
    paddingTop: '72px',
  },
  visualSide: {
    flex: 1,
    background: '#F9FAFB',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRight: '1px solid #E5E7EB',
    '@media (max-width: 900px)': {
      display: 'none',
    }
  },
  visualContent: {
    maxWidth: '480px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '99px',
    background: '#f0f9ff',
    color: '#87CEEB',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '32px',
  },
  visualTitle: {
    fontSize: '48px',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#374151',
    letterSpacing: '-0.02em',
    marginBottom: '24px',
  },
  visualSub: {
    fontSize: '18px',
    color: '#9CA3AF',
    lineHeight: 1.6,
    marginBottom: '48px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  featureText: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#374151',
  },
  visualFooter: {
    marginTop: 'auto',
    paddingTop: '40px',
    fontSize: '14px',
    color: '#9CA3AF',
  },
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#374151',
    marginBottom: '8px',
  },
  formSub: {
    fontSize: '15px',
    color: '#9CA3AF',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  forgotPass: {
    fontSize: '13px',
    color: '#87CEEB',
    textDecoration: 'none',
    fontWeight: 500,
  },
  divider: {
    margin: '24px 0',
    position: 'relative',
    textAlign: 'center',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      background: '#E5E7EB',
      zIndex: 1,
    }
  },
  dividerText: {
    background: '#fff',
    padding: '0 12px',
    fontSize: '13px',
    color: '#9CA3AF',
    position: 'relative',
    zIndex: 2,
  },
  googleBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#374151',
    fontSize: '15px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '24px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#9CA3AF',
  },
  linkText: {
    color: '#87CEEB',
    fontWeight: 600,
    cursor: 'pointer',
  }
}
