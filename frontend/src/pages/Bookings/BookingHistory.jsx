import React, { useState, useEffect, useCallback } from 'react'
import { MdRefresh, MdCheckCircle, MdCancel, MdSearch, MdQrCodeScanner, MdFactCheck, MdHistory, MdEventNote } from 'react-icons/md'
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
      case 'APPROVED': 
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>APPROVED</span>
      case 'REJECTED': 
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>REJECTED</span>
      case 'PENDING': 
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>PENDING</span>
      case 'CANCELLED': 
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280' }}>CANCELLED</span>
      default: 
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280' }}>{status}</span>
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">{view === 'MY' ? 'Booking History' : 'Requests Management'}</h1>
          <p className="page-subtitle">
            {view === 'MY' 
              ? 'View your reservations and upcoming campus activities.' 
              : 'Approve or manage campus facility booking requests.'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {isAdmin() && (
            <div className="flex items-center p-1 bg-white rounded-xl shadow-sm border border-gray-100">
              <button 
                className={`btn-toggle ${view === 'MY' ? 'active' : ''}`}
                onClick={() => setView('MY')}
              >
                <MdHistory size={18} />
                <span>My Bookings</span>
              </button>
              <button 
                className={`btn-toggle ${view === 'ALL' ? 'active' : ''}`}
                onClick={() => setView('ALL')}
              >
                <MdFactCheck size={18} />
                <span>Admin View</span>
              </button>
            </div>
          )}
          <button className="btn-icon-bg" onClick={fetchBookings} title="Refresh">
            <MdRefresh size={20} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="card empty-state" style={{ padding: '6rem 2rem' }}>
          <div className="empty-state-icon" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.8 }}>📅</div>
          <div className="empty-state-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>No bookings here yet</div>
          <p className="empty-state-desc" style={{ color: 'var(--text-muted)' }}>Reservations will appear in this section once created.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {view === 'ALL' && <th>Requestor</th>}
                <th>Facility/Resource</th>
                <th>Booking Purpose</th>
                <th>Schedule</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {bookings.map((booking) => (
                  <motion.tr 
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {view === 'ALL' && (
                      <td>
                        <div className="flex flex-col">
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{booking.userName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.userEmail}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{booking.resourceName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{booking.purpose}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div className="flex flex-col">
                        <span style={{ fontWeight: 600 }}>{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                        <span>{format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        {booking.status === 'APPROVED' && view === 'MY' && (
                          <button 
                            className="btn-action" 
                            onClick={() => setSelectedBooking(booking)}
                            title="Check-in QR"
                          >
                            <MdQrCodeScanner size={18} />
                          </button>
                        )}
                        
                        {view === 'ALL' && booking.status === 'PENDING' && (
                          <button 
                            className="btn btn-primary btn-sm btn-pill shadow-sm"
                            style={{ fontSize: '0.75rem', padding: '6px 16px' }}
                            onClick={() => setApprovalModal(booking)}
                          >
                            Review
                          </button>
                        )}

                        {['PENDING', 'APPROVED'].includes(booking.status) && (view === 'MY' || isAdmin()) && (
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleCancel(booking.id)}
                            title="Cancel Booking"
                          >
                            <MdCancel size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal (Minimalist) */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <motion.div 
              className="card" 
              style={{ maxWidth: '400px', width: '90%', padding: '32px', textAlign: 'center' }}
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Security Check-in</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Scan this code at the facility entrance</p>
              
              <div style={{ 
                background: '#fff', 
                padding: '24px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                display: 'inline-block',
                marginBottom: '24px',
                border: '1px solid #f0f0f0'
              }}>
                <QRCodeSVG 
                  value={`SMART_CAMPUS_BOOKING:${selectedBooking.id}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <div className="text-left" style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <p style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedBooking.resourceName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <MdEventNote color="var(--primary)" />
                  <span>{format(new Date(selectedBooking.startTime), 'EEEE, MMM do')}</span>
                </div>
                <p style={{ marginLeft: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{format(new Date(selectedBooking.startTime), 'HH:mm')} - {format(new Date(selectedBooking.endTime), 'HH:mm')}</p>
              </div>

              <button className="btn btn-primary w-full btn-pill" onClick={() => setSelectedBooking(null)}>Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal (Refined) */}
      <AnimatePresence>
        {approvalModal && (
          <div className="modal-overlay" onClick={() => setApprovalModal(null)}>
            <motion.div 
              className="card" 
              style={{ maxWidth: '480px', width: '90%', padding: '32px' }}
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Review Booking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Assess the request for {approvalModal.resourceName}</p>
              
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                <div className="flex justify-between mb-2">
                   <span style={{ fontWeight: 700 }}>Requestor:</span>
                   <span>{approvalModal.userName}</span>
                </div>
                <div className="flex justify-between mb-2">
                   <span style={{ fontWeight: 700 }}>Purpose:</span>
                   <span>{approvalModal.purpose}</span>
                </div>
                <div className="flex justify-between">
                   <span style={{ fontWeight: 700 }}>Time:</span>
                   <span>{format(new Date(approvalModal.startTime), 'HH:mm')} - {format(new Date(approvalModal.endTime), 'HH:mm')}</span>
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision Note</label>
                <textarea 
                   className="form-textarea" 
                   style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '12px', minHeight: '100px' }}
                   placeholder="Add feedback for the user..."
                   value={adminNote}
                   onChange={e => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button className="btn btn-pill bg-gray-100 w-full" style={{ background: '#f3f4f6' }} onClick={() => handleApproval('REJECTED')}>
                  Reject
                </button>
                <button className="btn btn-primary btn-pill shadow-sm w-full" onClick={() => handleApproval('APPROVED')}>
                  Approve Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-toggle.active {
          background: var(--bg-app);
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .btn-icon-bg {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .btn-icon-bg:hover {
          color: var(--primary);
          background: var(--bg-app);
        }
        .btn-action {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-app);
          border: none;
          border-radius: 10px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action:hover {
          color: var(--primary);
          background: #eee;
        }
        .btn-delete:hover {
          color: var(--coral);
          background: #ffe4e4;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  )
}

export default BookingHistory
