import React, { useState } from 'react'
import { MdEvent, MdPeople, MdDescription, MdAccessTime, MdClose } from 'react-icons/md'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const BookingForm = ({ resource, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    attendeeCount: 1,
    startTime: '',
    endTime: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('End time must be after start time')
      return
    }

    setLoading(true)
    try {
      await bookingService.create({
        ...formData,
        resourceId: resource.id
      })
      toast.success('Booking request submitted!')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        className="card" 
        style={{ maxWidth: '500px', width: '90%', padding: '32px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <MdClose size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Reserve Facility</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Fill in the details to request a reservation.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-app)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
           <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
             {resource.type === 'ROOM' ? '🏫' : resource.type === 'VEHICLE' ? '🚐' : '🛠️'}
           </div>
           <div>
             <p style={{ fontWeight: 800, fontSize: '1rem' }}>{resource.name}</p>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{resource.location} • Max {resource.capacity} people</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purpose of Booking</label>
            <div style={{ position: 'relative' }}>
              <MdDescription style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '44px', background: 'var(--bg-app)', border: 'none' }}
                placeholder="Study Group, Workshop, etc."
                required
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Number of Attendees</label>
            <div style={{ position: 'relative' }}>
              <MdPeople style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input 
                type="number" 
                className="form-input" 
                style={{ paddingLeft: '44px', background: 'var(--bg-app)', border: 'none' }}
                min="1"
                max={resource.capacity}
                required
                value={formData.attendeeCount}
                onChange={e => setFormData({...formData, attendeeCount: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Start Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                style={{ background: 'var(--bg-app)', border: 'none', fontSize: '0.85rem' }}
                required
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>End Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                style={{ background: 'var(--bg-app)', border: 'none', fontSize: '0.85rem' }}
                required
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button type="button" className="btn btn-pill bg-gray-100 w-full" style={{ background: '#f3f4f6' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-pill shadow-sm w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Request Booking'}
            </button>
          </div>
        </form>
      </motion.div>
    </div >
  )
}

export default BookingForm
