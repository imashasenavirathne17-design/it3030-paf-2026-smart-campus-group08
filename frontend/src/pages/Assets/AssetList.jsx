import React, { useState, useEffect, useCallback } from 'react'
import { MdSearch, MdFilterList, MdAdd, MdRefresh } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import resourceService from '../../services/resourceService'
import AssetCard from '../../components/AssetCard'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const AssetList = () => {
  const { isAdmin } = useAuth()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (filterType !== 'ALL') params.type = filterType
      if (filterStatus !== 'ALL') params.status = filterStatus
      
      const res = await resourceService.getAll(params)
      setAssets(res.data)
    } catch (err) {
      toast.error('Failed to load assets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterType, filterStatus])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [fetchAssets])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id)
        toast.success('Resource deleted')
        fetchAssets()
      } catch (err) {
        toast.error('Failed to delete resource')
      }
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Facilities & Assets</h1>
          <p className="page-subtitle">Manage and book campus resources efficiently.</p>
        </div>
        
        {isAdmin() && (
          <button className="btn btn-primary btn-pill shadow-sm" onClick={() => toast('Add Modal coming soon!')}>
            <MdAdd size={20} />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="card flex items-center gap-4 mb-8" style={{ padding: '12px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MdSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, location, or type..." 
            className="form-input"
            style={{ paddingLeft: '40px', border: 'none', background: 'var(--bg-app)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-secondary" />
            <select 
              className="form-select" 
              style={{ width: '140px', background: 'var(--bg-app)' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="ROOM">Rooms</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="VEHICLE">Vehicles</option>
            </select>

            <select 
              className="form-select" 
              style={{ width: '140px', background: 'var(--bg-app)' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          
          <button className="btn-icon" onClick={fetchAssets} title="Refresh">
            <MdRefresh size={20} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : assets.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <div className="empty-state-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>No resources found</div>
          <div className="empty-state-desc" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</div>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid gap-6" 
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        >
          <AnimatePresence mode="popLayout">
            {assets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AssetCard 
                  asset={asset} 
                  onDelete={handleDelete}
                  onEdit={() => toast('Edit coming soon!')}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-app);
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-icon:hover {
          background: #eee;
          color: var(--primary);
        }
      `}} />
    </div>
  )
}

export default AssetList
