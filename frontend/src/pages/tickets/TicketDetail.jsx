import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ticketsAPI } from '../../api/tickets'
import { usersAPI } from '../../api/users'

import { ArrowLeft, Send, User, MapPin, Calendar, Clock, Shield, Tag, MessageSquare, Edit2, Trash2, X, Check, AlertTriangle, Printer, Star } from 'lucide-react'
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRole = (user?.role || '').toUpperCase()
  const isAdmin = userRole === 'ADMIN'
  const isTech  = userRole === 'TECHNICIAN'
  
  const [ticket, setTicket]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [comment, setComment]   = useState('')
  const [sending, setSending]   = useState(false)
  const [techId, setTechId]     = useState('')
  const [technicians, setTechnicians] = useState([])
  const [activeTab, setActiveTab] = useState('comments') // 'comments' or 'history'
  const [assigning, setAssigning] = useState(false)
  const [timeLeft, setTimeLeft]     = useState('')
  const [urgency, setUrgency]       = useState('none') // none, warning, danger, breached

  // Comment Editing States
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [userFeedback, setUserFeedback] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const load = () => ticketsAPI.getById(id).then(setTicket).catch(() => navigate('/tickets')).finally(() => setLoading(false))
  
  useEffect(() => { 
    load() 
    if (isAdmin) {
      usersAPI.getTechnicians().then(setTechnicians).catch(console.error)
    }
  }, [id, isAdmin])

  useEffect(() => {
    if (!ticket?.slaDeadline || ['RESOLVED', 'CLOSED'].includes(ticket.status)) {
      setTimeLeft(''); setUrgency('none'); return;
    }

    const timer = setInterval(() => {
      const deadline = new Date(ticket.slaDeadline + 'Z');
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('SLA BREACHED');
        setUrgency('breached');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      
      if (hours < 1) setUrgency('danger');
      else if (hours < 6) setUrgency('warning');
      else setUrgency('none');
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket]);

  const handlePrint = () => window.print();

  const handleStatusChange = async (status) => {
    try {
      let payload = { status }
      if (status === 'REJECTED') {
        const reason = window.prompt("Enter rejection reason:")
        if (!reason) return
        payload.rejectionReason = reason
      } else if (status === 'RESOLVED') {
        const notes = window.prompt("Enter resolution notes:")
        if (!notes) return
        payload.resolutionNotes = notes
      }
      await ticketsAPI.update(id, payload)
      toast.success(`Status updated to ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAssign = async () => {
    if (!techId) { toast.error('Enter technician ID'); return }
    setAssigning(true)
    try { 
      await ticketsAPI.update(id, { assignedToId: techId })
      toast.success('Technician assigned')
      load() 
    } catch {
      toast.error('Assignment failed')
    } finally { 
      setAssigning(false) 
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setSending(true)
    try { 
      await ticketsAPI.addComment(id, { content: comment })
      setComment('')
      load() 
    } catch {
      toast.error('Failed to add comment')
    } finally { 
      setSending(false) 
    }
  }

  const handleDeleteComment = async (cId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await ticketsAPI.deleteComment(id, cId)
      toast.success('Comment deleted')
      load()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete'
      toast.error(msg)
      console.error('Delete error:', err)
    }
  }

  const startEdit = (c) => {
    setEditingCommentId(c.id)
    setEditingContent(c.content)
  }

  const handleUpdateComment = async () => {
    if (!editingContent.trim()) return
    try {
      await ticketsAPI.updateComment(id, editingCommentId, { content: editingContent })
      setEditingCommentId(null)
      load()
      toast.success('Comment updated')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update'
      toast.error(msg)
      console.error('Update error:', err)
    }
  }

  const handleSubmitFeedback = async () => {
    if (userRating === 0) { toast.error('Please select a rating'); return }
    setSubmittingFeedback(true)
    try {
      await ticketsAPI.submitFeedback(id, { rating: userRating, feedback: userFeedback })
      toast.success('Feedback submitted! Thank you.')
      load()
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) return (
    <div className="empty-state">
      <div className="spinner spinner-lg" />
      <p>Loading ticket details...</p>
    </div>
  )
  if (!ticket) return null

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header Area */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button onClick={() => navigate('/tickets')} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
            <ArrowLeft size={16}/> Back to Tickets
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{ticket.title}</h1>
            <span className={`badge status-${ticket.status.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {ticket.status.replace('_',' ')}
            </span>
          </div>
        </div>
        <button onClick={handlePrint} className="btn btn-outline no-print" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Printer size={16}/> Generate Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr var(--right-panel-width)', gap: 24 }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="stat-card" style={{ gap: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-primary"><Tag size={12}/> {ticket.category}</span>
              <span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority} Priority</span>
              {timeLeft && (
                <span className={`badge badge-${urgency === 'breached' ? 'danger' : urgency === 'danger' ? 'danger pulsed' : urgency === 'warning' ? 'warning' : 'gray'}`} 
                      style={{ display: 'flex', gap: 4, alignItems: 'center', fontWeight: 700 }}>
                  <Clock size={12} />
                  {timeLeft}
                </span>
              )}
            </div>
            
            {ticket.status === 'REJECTED' && ticket.rejectionReason && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 16, borderRadius: 8, fontSize: 14 }}>
                <strong>Rejection Reason:</strong> {ticket.rejectionReason}
              </div>
            )}
            {ticket.status === 'RESOLVED' && ticket.resolutionNotes && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: 16, borderRadius: 8, fontSize: 14 }}>
                <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
              </div>
            )}

            <div className="description-box" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              {ticket.description}
            </div>

            {/* User Feedback Display */}
            {(ticket.rating || ticket.feedback) && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-alt)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>USER FEEDBACK</p>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= ticket.rating ? 'var(--warning)' : 'none'} color={s <= ticket.rating ? 'var(--warning)' : 'var(--text-muted)'} />)}
                </div>
                <p style={{ fontSize: 14, fontStyle: 'italic' }}>"{ticket.feedback || 'No comments provided'}"</p>
              </div>
            )}

            {ticket.images?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p className="form-label" style={{ marginBottom: 12 }}>Attachments</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {ticket.images.map((img, i) => (
                    <img key={i} src={img} alt="Attachment" 
                      style={{ width: 150, height: 110, objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity/Comments Card */}
          <div className="stat-card" style={{ gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 16 }}>
              <button 
                onClick={() => setActiveTab('comments')} 
                style={{ 
                  background:'none', border:'none', padding:'0 0 8px 0', cursor:'pointer', 
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: activeTab === 'comments' ? 700 : 500,
                  fontSize: 15,
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={18}/> Comments
              </button>
              <button 
                onClick={() => setActiveTab('history')} 
                style={{ 
                  background:'none', border:'none', padding:'0 0 8px 0', cursor:'pointer', 
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: activeTab === 'history' ? 700 : 500,
                  fontSize: 15,
                  transition: 'all 0.2s'
                }}
              >
                <Clock size={18}/> Audit Log
              </button>
            </div>

            {activeTab === 'comments' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ticket.comments?.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <p>No comments yet. Start the conversation!</p>
                </div>
              ) : (
                ticket.comments?.map(c => {
                  const isOwner = c.userId === user?.id
                  const canManage = isAdmin || isOwner

                  return (
                    <div key={c.id} style={{ 
                      display: 'flex', gap: 12, 
                      flexDirection: isOwner ? 'row-reverse' : 'row' 
                    }}>
                      <div className="stat-icon" style={{ 
                        width: 36, height: 36, background: isOwner ? 'var(--primary-light)' : 'var(--bg-alt)',
                        minWidth: 36
                      }}>
                        <User size={18} color={isOwner ? 'var(--primary-dark)' : 'var(--text-secondary)'} />
                      </div>
                      <div style={{ 
                        flex: 1, padding: 16, borderRadius: 'var(--radius)',
                        background: isOwner ? 'var(--primary-light)' : 'var(--bg-alt)',
                        border: isOwner ? '1px solid var(--primary)' : '1px solid var(--border)',
                        maxWidth: '80%',
                        alignSelf: isOwner ? 'flex-end' : 'flex-start',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{c.userName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(c.createdAt), 'MMM d, HH:mm')}</span>
                            
                            {/* Edit/Delete Actions */}
                            {canManage && editingCommentId !== c.id && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                {isOwner && (
                                  <button onClick={() => startEdit(c)} className="btn-ghost" style={{ padding: 2, color: 'var(--text-muted)', border: 'none', background: 'none' }}>
                                    <Edit2 size={12}/>
                                  </button>
                                )}
                                <button onClick={() => handleDeleteComment(c.id)} className="btn-ghost" style={{ padding: 2, color: 'var(--danger)', border: 'none', background: 'none' }}>
                                  <Trash2 size={12}/>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <input className="form-input" style={{ fontSize: 14 }} value={editingContent} onChange={e => setEditingContent(e.target.value)} />
                            <button onClick={handleUpdateComment} className="btn btn-primary btn-icon"><Check size={14}/></button>
                            <button onClick={() => setEditingCommentId(null)} className="btn btn-outline btn-icon"><X size={14}/></button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 14 }}>{c.content}</div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <input className="form-input" value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Write an update..." onKeyDown={e => e.key==='Enter' && handleComment()} />
                <button onClick={handleComment} className="btn btn-primary" disabled={sending || !comment.trim()}>
                  {sending ? <div className="spinner" /> : <Send size={16}/>}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ticket.history?.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <p>No history records found.</p>
                </div>
              ) : (
                ticket.history?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < ticket.history.length - 1 ? '1px solid var(--bg-alt)' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{h.action}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        By {h.userName} • {format(new Date(h.timestamp), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

          {/* Feedback Form */}
          {user?.id === ticket.submittedById && ['RESOLVED', 'CLOSED'].includes(ticket.status) && !ticket.rating && (
            <div className="stat-card" style={{ border: '2px solid var(--primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Star size={20} color="var(--primary)"/>
                <h3 style={{ fontSize: 18 }}>How was our service?</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setUserRating(s)} className="btn-ghost" style={{ padding: 4, background: 'none', border: 'none' }}>
                    <Star size={32} fill={s <= userRating ? '#f59e0b' : 'none'} color={s <= userRating ? '#f59e0b' : '#94a3b8'} />
                  </button>
                ))}
              </div>
              <textarea className="form-textarea" placeholder="Any additional comments..." value={userFeedback} onChange={e => setUserFeedback(e.target.value)} style={{ marginBottom: 16, width: '100%', borderRadius: 8, padding: 12 }} />
              <button onClick={handleSubmitFeedback} className="btn btn-primary" disabled={submittingFeedback || userRating === 0}>
                Submit Feedback
              </button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(isAdmin || isTech) && (
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Shield size={18} color="var(--primary)"/>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Update Status</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={ticket.status === s}
                    className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'flex-start', width: '100%' }}>
                    {ticket.status === s && '• '} {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="stat-card">
              <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, marginBottom: 16 }}>Assign Ticket</h4>
              <div style={{ background: 'var(--bg-main)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>CURRENT ASSIGNEE</p>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{ticket.assignedToName || 'Unassigned'}</p>
              </div>
              <div className="form-group">
                <select 
                  className="form-input" 
                  value={techId} 
                  onChange={e => setTechId(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                >
                  <option value="">Select Technician</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id.substring(0,8)}...)
                    </option>
                  ))}
                </select>
                <button onClick={handleAssign} className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled={assigning || !techId}>
                  {assigning ? <div className="spinner" /> : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          )}

          <div className="stat-card" style={{ gap: 16 }}>
            <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>Information</h4>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-icon" style={{ width: 32, height: 32, background: 'var(--primary-light)' }}>
                <User size={14} color="var(--primary-dark)"/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>SUBMITTED BY</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.submittedByName}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-icon" style={{ width: 32, height: 32, background: 'var(--primary-light)' }}>
                <MapPin size={14} color="var(--primary-dark)"/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>LOCATION</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.location || '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-icon" style={{ width: 32, height: 32, background: 'var(--primary-light)' }}>
                <Calendar size={14} color="var(--primary-dark)"/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>REPORTED ON</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-icon" style={{ width: 32, height: 32, background: 'var(--primary-light)' }}>
                <Clock size={14} color="var(--primary-dark)"/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>LAST ACTIVITY</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.updatedAt ? format(new Date(ticket.updatedAt), 'HH:mm') : 'No updates'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-icon" style={{ width: 32, height: 32, background: 'var(--primary-light)' }}>
                <Shield size={14} color="var(--primary-dark)"/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>CONTACT DETAILS</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.preferredContactDetails || 'No details provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          .no-print, .btn, .stat-icon, .form-input, .page-header button, .tabs, .form-textarea, .modal-overlay, #topbar, #sidebar, .Activity_Comments_Card { display: none !important; }
          
          body { background: white !important; color: #1e293b !important; padding: 0 !important; font-family: 'Times New Roman', serif; }
          .animate-fade-in { animation: none !important; }
          
          /* Premium Header */
          .print-doc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .campus-logo {
            font-size: 20pt;
            font-weight: 800;
            letter-spacing: -1px;
            color: #000;
            font-family: sans-serif;
          }
          .doc-type-label {
            text-align: right;
          }
          .doc-type-label h2 { font-size: 14pt; margin: 0; color: #64748b; }
          .doc-type-label p { font-size: 10pt; margin: 0; }

          .page-title { 
            font-size: 32pt !important; 
            margin: 20px 0 !important; 
            font-weight: 900;
            line-height: 1.1;
            color: #000 !important; 
          }

          /* Status Stamp Aesthetic */
          .status-stamp {
            display: inline-block;
            border: 4px solid #000;
            padding: 8px 24px;
            font-size: 18pt;
            font-weight: 900;
            text-transform: uppercase;
            transform: rotate(-3deg);
            margin-bottom: 30px;
          }

          /* Structured Data Table */
          .print-meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .print-meta-table td {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }
          .meta-label {
            font-weight: 700;
            font-size: 10pt;
            color: #64748b;
            text-transform: uppercase;
            width: 150px;
          }
          .meta-value {
            font-size: 12pt;
            font-weight: 600;
          }

          .description-box {
            font-size: 14pt;
            line-height: 1.8;
            margin: 40px 0;
            padding: 30px;
            background: #f1f5f9 !important;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }

          .section-header {
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin: 40px 0 20px;
          }

          .history-print-row {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 20px;
            padding: 10px 0;
            border-bottom: 1px dashed #cbd5e1;
            font-size: 11pt;
          }

          img { max-width: 48%; height: auto; margin: 1%; border: 1px solid #000; }

          .signature-area {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 100px;
            margin-top: 100px;
          }
          .sig-line {
            border-top: 2px solid #000;
            padding-top: 10px;
            font-size: 11pt;
            font-weight: 700;
            text-align: center;
          }
          
          .footer-note {
            margin-top: 50px;
            font-size: 9pt;
            color: #94a3b8;
            text-align: center;
            font-style: italic;
          }
        }
        .pulsed { animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Premium Print Layout */}
      <div className="no-web-only" style={{ display: 'none' }}>
        <div className="print-doc-header">
          <div className="campus-logo">SMART CAMPUS</div>
          <div className="doc-type-label">
            <h2>MAINTENANCE TICKET</h2>
            <p>Ref ID: {ticket.id.substring(0,8).toUpperCase()}</p>
          </div>
        </div>

        <div className="status-stamp">
          {ticket.status.replace('_',' ')}
        </div>

        <h1 className="page-title">{ticket.title}</h1>

        <table className="print-meta-table">
          <tbody>
            <tr>
              <td className="meta-label">Category</td>
              <td className="meta-value">{ticket.category}</td>
              <td className="meta-label">Priority</td>
              <td className="meta-value">{ticket.priority}</td>
            </tr>
            <tr>
              <td className="meta-label">Location</td>
              <td className="meta-value">{ticket.location || 'Not Specified'}</td>
              <td className="meta-label">Reported On</td>
              <td className="meta-value">{ticket.createdAt && format(new Date(ticket.createdAt), 'MMMM dd, yyyy HH:mm')}</td>
            </tr>
            <tr>
              <td className="meta-label">Submitted By</td>
              <td className="meta-value">{ticket.submittedByName}</td>
              <td className="meta-label">Assigned To</td>
              <td className="meta-value">{ticket.assignedToName || 'PENDING ASSIGNMENT'}</td>
            </tr>
          </tbody>
        </table>

        <div className="section-header">Incident Description</div>
        <div className="description-box">{ticket.description}</div>

        {ticket.history?.length > 0 && (
          <>
            <div className="section-header">Audit History</div>
            {ticket.history.map((h, i) => (
              <div key={i} className="history-print-row">
                <strong>{format(new Date(h.timestamp), 'MMM dd, HH:mm')}</strong>
                <span>{h.action} (by {h.userName})</span>
              </div>
            ))}
          </>
        )}

        <div className="signature-area">
          <div className="sig-line">Technician Signature & Date</div>
          <div className="sig-line">Departmental Head Approval</div>
        </div>

        <div className="footer-note">
          This is an official document generated by the Smart Campus Operations Hub. All timestamps are recorded in the central audit system.
        </div>
      </div>
    </div>
  )
}
