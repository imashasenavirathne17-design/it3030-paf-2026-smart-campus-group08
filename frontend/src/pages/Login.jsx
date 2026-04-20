import React from 'react'
import { MdBusiness } from 'react-icons/md'

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ 
      backgroundColor: 'var(--bg-app)', 
      padding: '20px'
    }}>
      <div className="card animate-slide-up" style={{ 
        maxWidth: '420px', 
        width: '100%', 
        padding: '3rem', 
        textAlign: 'center',
        borderRadius: '24px',
        background: '#fff',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ 
          width: '64px', height: '64px', 
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--primary)'
        }}>
          <MdBusiness size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
          Manage your campus operations with ease.
        </p>

        <button 
          onClick={handleGoogleLogin} 
          className="btn btn-primary w-full btn-pill"
          style={{ 
            height: '52px', 
            fontSize: '1rem',
            boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.25)'
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
          Only authorized university accounts can access this portal.
        </p>
      </div>

      <footer style={{ 
        position: 'absolute', bottom: '2rem', 
        fontSize: '0.75rem', color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        © 2026 Smart Campus Hub. All rights reserved.
      </footer>
    </div>
  )
}

export default Login
