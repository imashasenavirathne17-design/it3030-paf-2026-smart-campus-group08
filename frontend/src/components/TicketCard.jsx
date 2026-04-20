import React from 'react'
import { MdLocationOn, MdAccessTime, MdPerson, MdComment, MdImage, MdPriorityHigh } from 'react-icons/md'
import { format } from 'date-fns'

const TicketCard = ({ ticket, onClick }) => {
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'CRITICAL': return { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
      case 'HIGH': return { label: 'HIGH', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
      case 'MEDIUM': return { label: 'MEDIUM', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
      case 'LOW': return { label: 'LOW', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
      default: return { label: priority, color: '#6b7280', bg: '#f3f4f6' }
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'OPEN': return { label: 'Open', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
      case 'IN_PROGRESS': return { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
      case 'RESOLVED': return { label: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
      case 'CLOSED': return { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' }
      case 'REJECTED': return { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
      default: return { label: status, color: '#6b7280', bg: '#f3f4f6' }
    }
  }

  const priority = getPriorityInfo(ticket.priority)
  const status = getStatusInfo(ticket.status)

  return (
    <div className="card" onClick={onClick} style={{ 
      padding: '24px', 
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Priority Indicator Stripe */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: '4px', 
        background: priority.color 
      }} />

      <div className="flex justify-between items-center">
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            background: priority.bg, 
            color: priority.color,
            letterSpacing: '0.05em'
          }}>
            {priority.label}
          </span>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            background: status.bg, 
            color: status.color,
            letterSpacing: '0.05em'
          }}>
            {status.label.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          #{ticket.id?.slice(-6).toUpperCase() || 'N/A'}
        </span>
      </div>

      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {ticket.category}
        </p>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>{ticket.title}</h3>
      </div>

      <p style={{ 
        fontSize: '0.9rem', 
        color: 'var(--text-secondary)', 
        lineHeight: 1.5,
        display: '-webkit-box', 
        WebkitLineClamp: 2, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden' 
      }}>
        {ticket.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="flex items-center gap-2 text-xs text-secondary">
          <MdLocationOn size={14} color="var(--primary)" />
          <span className="truncate">{ticket.location || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <MdAccessTime size={14} color="var(--primary)" />
          <span>{format(new Date(ticket.createdAt), 'MMM d')}</span>
        </div>
      </div>

      <div style={{ height: '1px', background: '#f0f0f0', width: '100%' }} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <MdPerson size={14} color="var(--text-muted)" />
           </div>
           <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{ticket.reportedByName}</span>
        </div>
        
        <div className="flex gap-3">
          {ticket.imageUrls?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <MdImage size={14} />
              <span>{ticket.imageUrls.length}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-primary font-bold">
            <MdComment size={14} />
            <span>Details</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
      `}} />
    </div>
  )
}

export default TicketCard
