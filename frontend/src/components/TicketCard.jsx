import React from 'react'
import { MdLocationOn, MdAccessTime, MdPerson, MdComment, MdImage } from 'react-icons/md'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

const TicketCard = ({ ticket, onClick }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'priority-critical'
      case 'HIGH': return 'priority-high'
      case 'MEDIUM': return 'priority-medium'
      case 'LOW': return 'priority-low'
      default: return 'badge-gray'
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-in_progress'
      case 'RESOLVED': return 'status-resolved'
      case 'CLOSED': return 'status-closed'
      case 'REJECTED': return 'status-rejected'
      default: return 'badge-gray'
    }
  }

  return (
    <div className="glass-card stat-card" onClick={onClick} style={{ 
      padding: '24px', 
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      borderLeft: `4px solid ${
        ticket.priority === 'CRITICAL' ? 'var(--coral-500)' :
        ticket.priority === 'HIGH' ? 'var(--yellow-500)' :
        'var(--teal-500)'
      }`
    }}>
      <div className="flex justify-between items-start">
        <span className={`badge ${getPriorityClass(ticket.priority)}`}>
          {ticket.priority}
        </span>
        <span className={`badge ${getStatusClass(ticket.status)}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>{ticket.title}</h3>
        <p className="text-xs text-muted font-bold uppercase tracking-widest">{ticket.category}</p>
      </div>

      <p className="text-sm text-secondary line-clamp-2" style={{ 
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
      }}>
        {ticket.description}
      </p>

      <div className="flex flex-direction-column gap-2 mt-2">
        <div className="flex items-center gap-2 text-xs text-secondary">
          <MdLocationOn className="text-teal" />
          {ticket.location || 'Not specified'}
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <MdAccessTime className="text-teal" />
          {format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm')}
        </div>
      </div>

      <div className="divider" style={{ margin: '8px 0', opacity: 0.3 }} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <MdPerson className="text-teal" />
           <span className="text-xs font-bold text-secondary">{ticket.reportedByName}</span>
        </div>
        
        <div className="flex gap-3">
          {ticket.imageUrls?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <MdImage /> {ticket.imageUrls.length}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted">
            <MdComment /> View Details
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketCard
