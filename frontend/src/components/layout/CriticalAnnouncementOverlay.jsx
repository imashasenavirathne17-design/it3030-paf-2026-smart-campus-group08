import React, { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function CriticalAnnouncementOverlay({ message, onClose }) {
  const [countdown, setCountdown] = useState(5)
  const [canClose, setCanClose] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanClose(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          <AlertTriangle size={48} color="#EF4444" />
        </div>
        
        <h2 style={styles.title}>CRITICAL ANNOUNCEMENT</h2>
        <div style={styles.messageBox}>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.footer}>
          {!canClose ? (
            <p style={styles.hint}>Please read carefully. You can close in {countdown}s...</p>
          ) : (
            <button onClick={onClose} style={styles.closeBtn} className="btn btn-danger">
              <X size={18} /> Acknowledge & Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', animation: 'fadeIn 0.4s ease'
  },
  modal: {
    background: '#fff', width: '100%', maxWidth: '600px',
    borderRadius: '32px', padding: '40px', textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '4px solid #EF4444',
    animation: 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  iconContainer: {
    width: '80px', height: '80px', borderRadius: '24px',
    background: '#FEE2E2', margin: '0 auto 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'pulse 2s infinite'
  },
  title: {
    fontSize: '28px', fontWeight: 900, color: '#1E293B',
    letterSpacing: '1px', marginBottom: '16px'
  },
  messageBox: {
    background: '#F8FAFC', borderRadius: '16px',
    padding: '24px', marginBottom: '32px', border: '1px solid #E2E8F0'
  },
  message: {
    fontSize: '18px', color: '#475569', fontWeight: 600, lineHeight: 1.6
  },
  footer: { minHeight: '48px' },
  hint: { fontSize: '14px', color: '#94A3B8', fontWeight: 500 },
  closeBtn: { width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700 }
}
