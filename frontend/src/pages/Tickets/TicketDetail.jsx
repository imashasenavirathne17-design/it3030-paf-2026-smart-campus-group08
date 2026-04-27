import React, { useState, useEffect, useCallback } from 'react'
import { 
  MdClose, MdLocationOn, MdAccessTime, MdPerson, MdSend, 
  MdDelete, MdCheckCircle, MdAssignmentInd, MdImage, MdComment 
} from 'react-icons/md'
import { format } from 'date-fns'
import ticketService from '../../services/ticketService'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const TicketDetail = ({ ticketId, onClose, onUpdate }) => {
  const { user, isAdmin, isTechnician } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isStaff = isAdmin() || isTechnician()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketService.getById(ticketId),
        ticketService.getComments(ticketId)
      ])
      setTicket(ticketRes.data)
      setComments(commentsRes.data)
    } catch (err) {
      toast.error('Failed to load ticket details')
      onClose()
    } finally {
      setLoading(false)
    }
  }, [ticketId, onClose])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await ticketService.addComment(ticketId, newComment)
      setNewComment('')
      const res = await ticketService.getComments(ticketId)
      setComments(res.data)
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    try {
      let note = ''
      if (status === 'RESOLVED') note = prompt('Enter resolution note:')
      if (status === 'RESOLVED' && note === null) return

      await ticketService.updateStatus(ticketId, { status, resolutionNote: note })
      toast.success(`Ticket marked as ${status.replace('_', ' ')}`)
      fetchData()
      onUpdate()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  if (loading) return (
     <div className="modal-overlay"><div className="spinner" /></div>
  )

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'CRITICAL': return { color: '#ef4444', bg: '#fee2e2' }
      case 'HIGH': return { color: '#f59e0b', bg: '#fef3c7' }
      case 'LOW': return { color: '#10b981', bg: '#d1fae5' }
      default: return { color: '#3b82f6', bg: '#dbeafe' }
    }
  }

  const prioInfo = getPriorityInfo(ticket.priority)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '900px', width: '95%', padding: '32px', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <MdClose size={24} />
        </button>

        <div className="flex gap-4 mb-6">
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            background: prioInfo.bg, 
            color: prioInfo.color,
            textTransform: 'uppercase'
          }}>
            {ticket.priority} 
          </span>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            background: 'var(--bg-app)', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>{ticket.title}</h2>

        <div className="flex flex-col md:flex-row gap-8" style={{ display: 'flex' }}>
          {/* Main Content */}
          <div style={{ flex: 1.5 }}>
            <div style={{ background: 'var(--bg-app)', padding: '24px', borderRadius: '20px', marginBottom: '32px' }}>
              <p style={{ lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '24px' }}>{ticket.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="icon-badge"><MdLocationOn color="var(--primary)" /></div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>LOCATION</span>
                    <span style={{ fontWeight: 600 }}>{ticket.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-badge"><MdPerson color="var(--primary)" /></div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORTED BY</span>
                    <span style={{ fontWeight: 600 }}>{ticket.reportedByName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-badge"><MdAccessTime color="var(--primary)" /></div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORTED AT</span>
                    <span style={{ fontWeight: 600 }}>{format(new Date(ticket.createdAt), 'PPpp')}</span>
                  </div>
                </div>
                {ticket.assignedToName && (
                  <div className="flex items-center gap-3">
                    <div className="icon-badge"><MdAssignmentInd color="var(--primary)" /></div>
                    <div className="flex flex-col">
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>ASSIGNED TO</span>
                      <span style={{ fontWeight: 600 }}>{ticket.assignedToName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {ticket.imageUrls?.length > 0 && (
              <div className="mb-8">
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Evidence Documentation</h4>
                <div className="flex gap-4">
                  {ticket.imageUrls.map((url, i) => (
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      key={i} 
                      src={url} 
                      alt="evidence" 
                      style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {isStaff && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Staff Operations</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn btn-pill bg-white text-muted border border-gray-100" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Processing</button>
                  <button onClick={() => handleUpdateStatus('RESOLVED')} className="btn btn-primary btn-pill shadow-sm" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>Mark Resolved</button>
                  <button onClick={() => handleUpdateStatus('CLOSED')} className="btn btn-pill bg-white text-muted border border-gray-100" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Archive</button>
                  <button onClick={() => handleUpdateStatus('REJECTED')} className="btn btn-pill bg-white text-coral border border-gray-100" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Reject</button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Activity Stream</h4>
            
            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', marginBottom: '16px', paddingRight: '8px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>
                  <MdComment size={40} style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No discussions yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-primary" style={{ fontSize: '0.85rem' }}>{comment.userName}</span>
                        <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{format(new Date(comment.createdAt), 'HH:mm • MMM d')}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                className="form-input" 
                style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '16px', padding: '12px 16px' }}
                placeholder="Type a message..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '48px', height: '48px', minWidth: '48px', padding: 0, borderRadius: '16px' }} 
                disabled={submitting}
              >
                <MdSend size={20} />
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }
        .comment-bubble {
          background: #fff;
          padding: 12px 16px;
          border-radius: 16px;
          border-left: 3px solid var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
      `}} />
    </div>
  )
}

export default TicketDetail
