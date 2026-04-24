import React from 'react'
import { MdLocationOn, MdPeople, MdCheckCircle, MdError, MdEdit, MdDelete } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const AssetCard = ({ asset, onEdit, onDelete }) => {
  const { isAdmin } = useAuth()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE': return <MdCheckCircle className="text-teal" />
      case 'OCCUPIED': return <MdError style={{ color: 'var(--yellow-400)' }} />
      case 'MAINTENANCE': return <MdError className="text-coral" />
      default: return null
    }
  }

  return (
    <div className="glass-card stat-card" style={{ 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      overflow: 'visible'
    }}>
      <div className="flex justify-between items-start">
        <div style={{
          width: '48px', height: '48px',
          background: 'rgba(20, 184, 166, 0.1)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: 'var(--teal-400)'
        }}>
          {asset.type === 'ROOM' ? '🏫' : asset.type === 'EQUIPMENT' ? '🛠️' : '📽️'}
        </div>
        
        <div className={`badge ${
          asset.status === 'AVAILABLE' ? 'badge-teal' : 
          asset.status === 'OCCUPIED' ? 'badge-yellow' : 'badge-coral'
        }`}>
          {asset.status}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{asset.name}</h3>
        <p className="text-xs text-muted font-bold uppercase tracking-widest">{asset.type}</p>
      </div>

      <div className="flex flex-direction-column gap-2 mt-2">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <MdLocationOn style={{ color: 'var(--teal-400)' }} />
          {asset.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <MdPeople style={{ color: 'var(--teal-400)' }} />
          Capacity: {asset.capacity}
        </div>
      </div>

      <div className="divider" style={{ margin: '8px 0', opacity: 0.3 }} />

      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-teal">${asset.pricePerHour || 0}/hr</span>
        
        <div className="flex gap-2">
          {isAdmin() && (
            <>
              <button onClick={() => onEdit(asset)} className="btn-ghost btn-sm" style={{ padding: '6px' }}>
                <MdEdit size={18} />
              </button>
              <button onClick={() => onDelete(asset.id)} className="btn-ghost btn-sm text-coral" style={{ padding: '6px' }}>
                <MdDelete size={18} />
              </button>
            </>
          )}
          <button className="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </div>
  )
}

export default AssetCard
