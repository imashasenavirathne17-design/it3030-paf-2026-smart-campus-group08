import React, { useState } from 'react'
import { MdEvent, MdPeople, MdDescription, MdAccessTime } from 'react-icons/md'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Booking</h3>
          <button className="btn-ghost" onClick={onClose}>×</button>
        </div>

        <div className="flex items-center gap-4 mb-6 glass-card" style={{ padding: '12px' }}>
           <div style={{ fontSize: '2rem' }}>
             {resource.type === 'ROOM' ? '🏫' : '🛠️'}
           </div>
           <div>
             <p className="font-bold">{resource.name}</p>
             <p className="text-xs text-secondary">{resource.location} • Max Capacity: {resource.capacity}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-direction-column gap-4">
          <div className="form-group">
            <label className="form-label">Purpose of Booking</label>
            <div style={{ position: 'relative' }}>
              <MdDescription style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. Study Group, Workshop, Meeting"
                required
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Attendees</label>
            <div style={{ position: 'relative' }}>
              <MdPeople style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="number" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                min="1"
                max={resource.capacity}
                required
                value={formData.attendeeCount}
                onChange={e => setFormData({...formData, attendeeCount: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="form-group w-full">
              <label className="form-label">Start Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className="form-group w-full">
              <label className="form-label">End Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingForm
