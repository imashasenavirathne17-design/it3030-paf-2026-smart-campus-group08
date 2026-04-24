import { useState, useEffect } from 'react'
import { X, Save, BellRing, BellOff } from 'lucide-react'
import { usersAPI } from '../api/users'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function PreferencesModal({ onClose }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({
    BOOKING: true,
    TICKET: true,
    COMMENT: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.notificationPreferences) {
      setPrefs(prev => ({ ...prev, ...user.notificationPreferences }))
    }
  }, [user])

  const togglePref = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await usersAPI.updatePreferences(user.id, prefs)
      toast.success('Preferences saved successfully')
      
      // Update local storage user context if possible, but for now just close
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title">Notification Preferences</h3>
          <button className="btn btn-ghost" style={{ padding: 4 }} onClick={onClose}><X size={20}/></button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
            Choose which notifications you want to receive in the app.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PreferenceItem 
              title="Booking Updates" 
              desc="Receive alerts when your bookings are approved, rejected, or cancelled." 
              enabled={prefs.BOOKING} 
              onToggle={() => togglePref('BOOKING')} 
            />
            <PreferenceItem 
              title="Ticket Updates" 
              desc="Receive alerts when your maintenance tickets change status or are assigned." 
              enabled={prefs.TICKET} 
              onToggle={() => togglePref('TICKET')} 
            />
            <PreferenceItem 
              title="New Comments" 
              desc="Receive alerts when a technician comments on your ticket." 
              enabled={prefs.COMMENT} 
              onToggle={() => togglePref('COMMENT')} 
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={16}/> {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PreferenceItem({ title, desc, enabled, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ color: enabled ? 'var(--accent)' : 'var(--text-muted)', marginTop: 2 }}>
        {enabled ? <BellRing size={20} /> : <BellOff size={20} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</div>
      </div>
      <div 
        onClick={onToggle}
        style={{ 
          width: 44, height: 24, borderRadius: 12, 
          background: enabled ? 'var(--accent)' : 'var(--border)', 
          position: 'relative', cursor: 'pointer', transition: 'all 0.2s' 
        }}
      >
        <div style={{ 
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: enabled ? 22 : 2, transition: 'all 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}/>
      </div>
    </div>
  )
}
