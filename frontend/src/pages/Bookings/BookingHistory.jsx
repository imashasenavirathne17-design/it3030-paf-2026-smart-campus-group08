import React, { useState, useEffect, useCallback } from 'react'
import { MdRefresh, MdCheckCircle, MdCancel, MdSearch, MdQrCodeScanner, MdFactCheck, MdHistory } from 'react-icons/md'
import { format } from 'date-fns'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../context/AuthContext'

const BookingHistory = () => {
  const { user, isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [view, setView] = useState('MY') // 'MY' or 'ALL'
  const [approvalModal, setApprovalModal] = useState(null)
  const [adminNote, setAdminNote] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = view === 'MY' ? await bookingService.getMyBookings() : await bookingService.getAll()
      setBookings(res.data)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancel(id)
        toast.success('Booking cancelled')
        fetchBookings()
      } catch (err) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  const handleApproval = async (status) => {
    try {
      await bookingService.approveOrReject(approvalModal.id, {
        status,
        adminNote
      })
      toast.success(`Booking ${status.toLowerCase()}`)
      setApprovalModal(null)
      setAdminNote('')
      fetchBookings()
    } catch (err) {
      toast.error('Failed to process booking')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-teal">Approved</span>
      case 'REJECTED': return <span className="badge badge-coral">Rejected</span>
      case 'PENDING': return <span className="badge badge-yellow">Pending</span>
      case 'CANCELLED': return <span className="badge badge-gray">Cancelled</span>
      default: return <span className="badge badge-gray">{status}</span>
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">{view === 'MY' ? 'My Bookings' : 'Manage All Bookings'}</h1>
          <p className="page-subtitle">
            {view === 'MY' 
              ? 'Track your facility requests and access QR codes for check-in.' 
              : 'Review, approve, or reject campus-wide facility requests.'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isAdmin() && (
            <div className="flex glass-card" style={{ padding: '4px', borderRadius: '12px' }}>
              <button 
                className={`btn btn-sm ${view === 'MY' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('MY')}
              >
                <MdHistory /> My
              </button>
              <button 
                className={`btn btn-sm ${view === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('ALL')}
              >
                <MdFactCheck /> Administrative
              </button>
            </div>
          )}
          <button className="btn btn-ghost" onClick={fetchBookings}>
            <MdRefresh size={20} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No bookings found</div>
          <div className="empty-state-desc">Booking history will appear here.</div>
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                {view === 'ALL' && <th>User</th>}
                <th>Resource</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  {view === 'ALL' && (
                    <td>
                      <div className="flex flex-direction-column">
                        <span className="font-bold text-sm">{booking.userName}</span>
                        <span className="text-xs text-muted">{booking.userEmail}</span>
                      </div>
                    </td>
                  )}
                  <td className="font-bold text-teal">{booking.resourceName}</td>
                  <td>{booking.purpose}</td>
                  <td className="text-sm">
                    {format(new Date(booking.startTime), 'MMM d, HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                  </td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      {booking.status === 'APPROVED' && view === 'MY' && (
                        <button 
                          className="btn-ghost btn-sm" 
                          onClick={() => setSelectedBooking(booking)}
                          title="View QR Code"
                        >
                          <MdQrCodeScanner size={18} />
                        </button>
                      )}
                      
                      {view === 'ALL' && booking.status === 'PENDING' && (
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setApprovalModal(booking)}
                        >
                          Review
                        </button>
                      )}

                      {['PENDING', 'APPROVED'].includes(booking.status) && (view === 'MY' || isAdmin()) && (
                        <button 
                          className="btn-ghost btn-sm text-coral" 
                          onClick={() => handleCancel(booking.id)}
                          title="Cancel"
                        >
                          <MdCancel size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <motion.div 
              className="modal-box text-center" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3 className="modal-title">Access QR Code</h3>
                <button className="btn-ghost" onClick={() => setSelectedBooking(null)}>×</button>
              </div>
              
              <div className="glass-card" style={{ padding: '32px', background: '#fff', borderRadius: '16px', display: 'inline-block', margin: '20px 0' }}>
                <QRCodeSVG 
                  value={`SMART_CAMPUS_BOOKING:${selectedBooking.id}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="mt-4">
                <p className="font-bold text-lg">{selectedBooking.resourceName}</p>
                <p className="text-secondary text-sm">
                  {format(new Date(selectedBooking.startTime), 'EEEE, MMMM do')}
                </p>
                <p className="text-secondary text-sm mb-6">
                  {format(new Date(selectedBooking.startTime), 'HH:mm')} - {format(new Date(selectedBooking.endTime), 'HH:mm')}
                </p>
                <div className="badge badge-teal">Valid for Check-in</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {approvalModal && (
          <div className="modal-overlay" onClick={() => setApprovalModal(null)}>
            <motion.div 
              className="modal-box" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3 className="modal-title">Review Booking Request</h3>
                <button className="btn-ghost" onClick={() => setApprovalModal(null)}>×</button>
              </div>
              
              <div className="glass-card mb-6" style={{ padding: '16px' }}>
                <p className="text-sm font-bold text-teal mb-1">{approvalModal.resourceName}</p>
                <p className="text-sm">User: {approvalModal.userName}</p>
                <p className="text-sm">Purpose: {approvalModal.purpose}</p>
                <p className="text-sm mt-2 text-secondary">
                  {format(new Date(approvalModal.startTime), 'MMM d, HH:mm')} - {format(new Date(approvalModal.endTime), 'HH:mm')}
                </p>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Note to User (Optional)</label>
                <textarea 
                   className="form-textarea" 
                   placeholder="Provide a reason for approval or rejection..."
                   value={adminNote}
                   onChange={e => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button className="btn btn-danger w-full" onClick={() => handleApproval('REJECTED')}>
                  Reject
                </button>
                <button className="btn btn-primary w-full" onClick={() => handleApproval('APPROVED')}>
                  Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  )
}

export default BookingHistory

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  )
}

export default BookingHistory
