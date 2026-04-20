import React, { useState, useEffect, useCallback } from 'react'
import { MdAdd, MdRefresh, MdFilterList, MdSearch } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import ticketService from '../../services/ticketService'
import TicketCard from '../../components/TicketCard'
import CreateTicket from './CreateTicket'
import TicketDetail from './TicketDetail'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const TicketList = () => {
  const { user, isAdmin, isTechnician } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  
  const isStaff = isAdmin() || isTechnician()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = isStaff ? await ticketService.getAll() : await ticketService.getMyTickets()
      setTickets(res.data)
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [isStaff])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const filteredTickets = tickets.filter(t => 
    filterStatus === 'ALL' || t.status === filterStatus
  )

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Campus Support</h1>
          <p className="page-subtitle">Report incidents and track maintenance requests.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="btn-icon-bg" onClick={fetchTickets} title="Refresh">
            <MdRefresh size={20} className={loading ? 'spin' : ''} />
          </button>
          {!isStaff && (
            <button className="btn btn-primary btn-pill shadow-sm" onClick={() => setShowCreate(true)}>
              <MdAdd size={20} />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card flex items-center justify-between mb-8" style={{ padding: '12px 24px' }}>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-secondary" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <select 
            className="form-select" 
            style={{ width: '160px', background: 'var(--bg-app)', border: 'none' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Requests</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
           <div className="flex items-center gap-2">
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
             <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{tickets.filter(t => t.status === 'OPEN').length} Open</span>
           </div>
           <div className="flex items-center gap-2">
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
             <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{tickets.filter(t => t.status === 'IN_PROGRESS').length} In Progress</span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filteredTickets.length === 0 ? (
        <div className="card empty-state" style={{ padding: '6rem 2rem' }}>
          <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.8 }}>🎫</div>
          <div className="empty-state-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>No tickets found</div>
          <p className="empty-state-desc" style={{ color: 'var(--text-muted)' }}>Reported issues will appear here for tracking.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid gap-6" 
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <TicketCard 
                  ticket={ticket} 
                  onClick={() => setSelectedTicketId(ticket.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
           <CreateTicket 
              onClose={() => setShowCreate(false)} 
              onSuccess={fetchTickets} 
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTicketId && (
          <TicketDetail 
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
            onUpdate={fetchTickets}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
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
      `}} />
    </div>
  )
}

export default TicketList
