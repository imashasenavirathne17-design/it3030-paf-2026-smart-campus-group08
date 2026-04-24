import React from 'react'
import { MdLocationOn, MdPeople, MdEdit, MdDelete, MdInfoOutline } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const AssetCard = ({ asset, onEdit, onDelete }) => {
  const { isAdmin } = useAuth()

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' }
      case 'OCCUPIED': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }
      case 'MAINTENANCE': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
      default: return { bg: '#f3f4f6', text: '#6b7280' }
    }
  }

  const statusStyle = getStatusColor(asset.status)

  return (
    <div className="card h-full flex flex-col transition-transform hover:-translate-y-1" style={{ 
      padding: '24px',
      position: 'relative',
      border: '1px solid #f0f0f0'
    }}>
      <div className="flex justify-between items-start mb-4">
        <div style={{
          width: '52px', height: '52px',
          background: 'var(--bg-app)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem'
        }}>
          {asset.type === 'ROOM' ? '🏫' : asset.type === 'EQUIPMENT' ? '🛠️' : '📽️'}
        </div>
        
        <div style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          textTransform: 'uppercase'
        }}>
          {asset.status}
        </div>
      </div>

      <div className="mb-4">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>
          {asset.name}
        </h3>
        <p style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {asset.type}
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          <MdLocationOn size={18} style={{ color: 'var(--primary)' }} />
          {asset.location}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          <MdPeople size={18} style={{ color: 'var(--primary)' }} />
          Cap: {asset.capacity} people
        </div>
      </div>

      <div className="mt-auto pt-4 flex justify-between items-center" style={{ borderTop: '1px dashed #eee' }}>
        <div className="flex flex-col">
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Rate</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>${asset.pricePerHour || 0}<small style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>/hr</small></span>
        </div>
        
        <div className="flex gap-2">
          {isAdmin() && (
            <>
              <button 
                onClick={() => onEdit(asset)} 
                className="btn-icon-small" 
                title="Edit"
              >
                <MdEdit size={16} />
              </button>
              <button 
                onClick={() => onDelete(asset.id)} 
                className="btn-icon-small text-coral" 
                style={{ color: 'var(--coral)' }}
                title="Delete"
              >
                <MdDelete size={16} />
              </button>
            </>
          )}
          <button className="btn btn-primary btn-pill btn-sm shadow-sm" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
            Book
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-icon-small {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f8fafc;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-icon-small:hover {
          background: #f1f5f9;
          color: var(--primary);
        }
        .text-coral {
          color: var(--coral) !important;
        }
      `}} />
    </div>
  )
}

export default AssetCard
