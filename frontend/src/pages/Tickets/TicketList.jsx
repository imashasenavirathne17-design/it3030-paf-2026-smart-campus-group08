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
          <h1 className="page-title">Incidents & Tickets</h1>
          <p className="page-subtitle">Report campus issues and track resolution progress.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="btn btn-ghost" onClick={fetchTickets}>
            <MdRefresh size={20} className={loading ? 'spin' : ''} />
          </button>
          {!isStaff && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <MdAdd size={20} />
              Report Issue
            </button>
          )}
        </div>
      </div>

      <div className="glass-card flex items-center gap-4 mb-8" style={{ padding: '12px 24px' }}>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-secondary" />
          <select 
            className="form-select" 
            style={{ width: '180px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <p className="text-sm text-secondary">
          Showing {filteredTickets.length} tickets
        </p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filteredTickets.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">🎫</div>
          <div className="empty-state-title">No tickets found</div>
          <div className="empty-state-desc">Issues you report will appear here.</div>
        </div>
      ) : (
        <motion.div 
          layout
          className="stats-grid" 
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
        >
          <AnimatePresence>
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
      {showCreate && (
         <CreateTicket 
            onClose={() => setShowCreate(false)} 
            onSuccess={fetchTickets} 
         />
      )}

      {selectedTicketId && (
        <TicketDetail 
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onUpdate={fetchTickets}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  )
}

export default TicketList
