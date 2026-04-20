import React from 'react'
import { MdBusiness } from 'react-icons/md'

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ 
      backgroundColor: 'var(--bg-app)', 
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(139, 92, 246, 0.03)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(20, 184, 166, 0.03)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 0
      }} />

      <div className="card animate-slide-up" style={{ 
        maxWidth: '420px', 
        width: '100%', 
        padding: '3rem', 
        textAlign: 'center',
        zIndex: 1,
        borderRadius: '24px'
      }}>
        <div style={{ 
          width: '64px', height: '64px', 
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--primary)'
        }}>
          <MdBusiness size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Smart Campus Operations Hub
        </p>

        <button 
          onClick={handleGoogleLogin} 
          className="btn btn-primary w-full btn-pill"
          style={{ 
            height: '52px', 
            fontSize: '1rem',
            boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.3)'
          }}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            width="20" 
            alt="Google" 
            style={{ marginRight: '12px' }}
          />
          Continue with Google
        </button>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <footer style={{ 
        position: 'absolute', bottom: '2rem', 
        fontSize: '0.75rem', color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        © 2026 Smart Campus Management.
      </footer>
    </div>
  )
}

export default Login
