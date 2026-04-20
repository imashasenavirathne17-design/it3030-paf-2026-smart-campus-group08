import React from 'react'
<<<<<<< HEAD
import { MdLogin, MdBusiness } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
=======
import { MdBusiness } from 'react-icons/md'
>>>>>>> feature/authentication

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
<<<<<<< HEAD
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '20px' }}>
      <div className="glass-card slide-up" style={{ 
        maxWidth: '440px', 
        width: '100%', 
        padding: '48px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          zIndex: -1
        }} />

        <div style={{ 
          width: '64px', height: '64px', 
          background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#fff', fontSize: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <MdBusiness />
        </div>

        <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Smart Campus
        </h1>
        <p className="text-secondary" style={{ marginBottom: '40px', fontSize: '1rem', fontWeight: 500 }}>
          Centralized Operations & Management Hub
        </p>

        <div className="divider" style={{ margin: '32px 0', opacity: 0.5 }} />

        <p className="text-sm text-secondary mb-6">
          Sign in with your university account to access facilities, bookings, and incident management.
=======
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
>>>>>>> feature/authentication
        </p>

        <button 
          onClick={handleGoogleLogin} 
<<<<<<< HEAD
          className="btn btn-primary btn-lg w-full justify-center"
          style={{ gap: '12px' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
          Continue with Google
        </button>

        <div className="mt-8 flex gap-4 justify-center opacity-50">
          <span className="badge badge-gray text-xs">Security</span>
          <span className="badge badge-gray text-xs">Efficiency</span>
          <span className="badge badge-gray text-xs">Campus Life</span>
        </div>
      </div>
      
      <footer style={{ 
        position: 'absolute', bottom: '32px', 
        fontSize: '0.8rem', color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        &copy; 2026 Smart Campus Hub. All rights reserved.
=======
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
>>>>>>> feature/authentication
      </footer>
    </div>
  )
}

export default Login
