import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  Mail,
  Lock,
  User,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/login')
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
              <Sparkles size={14} /> Join the Community
            </div>
            <h1 style={styles.visualTitle}>
              Start your journey <br/>
              with <span style={{ color: '#87CEEB' }}>Smart Campus</span>
            </h1>
            <p style={styles.visualSub}>
              Create your account to start managing bookings, resources, 
              and maintenance requests in one unified platform.
            </p>

            <div style={styles.featureList}>
              {[
                { title: 'Unified Experience', desc: 'Everything you need in one powerful dashboard.' },
                { title: 'Stay Notified', desc: 'Real-time updates on all your requests and activities.' },
                { title: 'Collaborative Hub', desc: 'Easily communicate with campus staff and administration.' }
              ].map((item, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={styles.checkIcon}>
                    <CheckCircle2 size={20} color="#87CEEB" />
                  </div>
                  <div>
                    <h4 style={styles.featureTitle}>{item.title}</h4>
                    <p style={styles.featureDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.visualFooter}>
            <p>© 2026 Smart Campus Hub. All rights reserved.</p>
          </div>
        </div>

        {/* Form Side */}
        <div style={styles.formSide}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Create Account</h2>
              <p style={styles.formSub}>Join hundreds of students using Smart Campus</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User style={styles.inputIcon} size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>University Email</label>
                <div style={styles.inputWrapper}>
                  <Mail style={styles.inputIcon} size={18} />
                  <input 
                    type="email" 
                    placeholder="john@university.edu"
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock style={styles.inputIcon} size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    style={styles.input}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'} <ChevronRight size={18} />
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerText}>or sign up with</span>
            </div>

            <GoogleLoginButton text="signup_with" width="400" />

            <p style={styles.footerText}>
              Already have an account? <span onClick={() => navigate('/login')} style={styles.linkText}>Sign In</span>
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
    gap: '32px',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
  },
  checkIcon: {
    marginTop: '4px',
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '4px',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#9CA3AF',
    lineHeight: 1.5,
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
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '15px',
    transition: 'all 0.2s',
    outline: 'none',
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
