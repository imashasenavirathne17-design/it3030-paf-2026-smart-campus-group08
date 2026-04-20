import React, { useState, useEffect, useCallback } from 'react'
import { 
  MdClose, MdLocationOn, MdAccessTime, MdPerson, MdSend, 
  MdDelete, MdCheckCircle, MdAssignmentInd, MdImage 
} from 'react-icons/md'
import { format } from 'date-fns'
import ticketService from '../../services/ticketService'
import toast from 'react-hot-toast'
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
           <div className="flex items-center gap-3">
              <span className={`badge ${
                ticket.priority === 'CRITICAL' ? 'priority-critical' : 'priority-low'
              }`}>{ticket.priority}</span>
              <h3 className="modal-title">{ticket.title}</h3>
           </div>
           <button className="btn-ghost" onClick={onClose}><MdClose size={24} /></button>
        </div>

        <div className="flex gap-6 mt-4 md-flex-row flex-direction-column" style={{ display: 'flex' }}>
          {/* Left Column: Info */}
          <div style={{ flex: 1 }}>
            <div className="glass-card mb-6" style={{ padding: '20px' }}>
              <p className="text-secondary mb-4">{ticket.description}</p>
              
              <div className="flex flex-direction-column gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <MdLocationOn className="text-teal" /> <strong>Location:</strong> {ticket.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MdPerson className="text-teal" /> <strong>Reported By:</strong> {ticket.reportedByName}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MdAccessTime className="text-teal" /> <strong>Reported At:</strong> {format(new Date(ticket.createdAt), 'PPpp')}
                </div>
                {ticket.assignedToName && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdAssignmentInd className="text-teal" /> <strong>Assigned To:</strong> {ticket.assignedToName}
                  </div>
                )}
              </div>
            </div>

            {ticket.imageUrls?.length > 0 && (
              <div className="mb-6">
                <h4 className="flex items-center gap-2 mb-3"><MdImage /> Evidence Photos</h4>
                <div className="flex gap-2">
                  {ticket.imageUrls.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="evidence" 
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Admin/Staff Controls */}
            {isStaff && (
              <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--teal-500)' }}>
                <h4 className="mb-4">Internal Controls</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn btn-ghost btn-sm">Set In Progress</button>
                  <button onClick={() => handleUpdateStatus('RESOLVED')} className="btn btn-primary btn-sm">Mark Resolved</button>
                  <button onClick={() => handleUpdateStatus('CLOSED')} className="btn btn-ghost btn-sm">Archive/Close</button>
                  <button onClick={() => handleUpdateStatus('REJECTED')} className="btn btn-ghost btn-sm text-coral">Reject</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Comments */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
            <h4 className="flex items-center gap-2 mb-3"><MdComment /> Activity Feed</h4>
            
            <div className="glass-card" style={{ flex: 1, overflowY: 'auto', padding: '16px', marginBottom: '16px' }}>
              {comments.length === 0 ? (
                <p className="text-center text-muted text-sm my-8">No comments yet.</p>
              ) : (
                <div className="flex flex-direction-column gap-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex flex-direction-column gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-teal">{comment.userName}</span>
                        <span className="text-xs text-muted">{format(new Date(comment.createdAt), 'MMM d, HH:mm')}</span>
                      </div>
                      <p className="text-sm glass-card" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)' }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                className="form-input" 
                placeholder="Write a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }} disabled={submitting}>
                <MdSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
