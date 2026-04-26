import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { resourcesAPI } from '../../api/resources'
import { Plus, Search, Edit2, Trash2, Building2, MapPin, Users, Info, Clock, Download, AlertTriangle, Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TYPES = ['ROOM', 'LAB', 'EQUIPMENT', 'HALL', 'FIELD', 'LIBRARY', 'OTHER']
const LOCATIONS = [
  '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor',
  'IT Store', 'Media Room', 'Event Store', 'Other'
]

export default function Resources() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCapacity, setFilterCapacity] = useState('')
  const [modal, setModal]         = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({ name:'', type:'ROOM', location:'', capacity:'', description:'', availabilityWindows:'', status:'ACTIVE' })
  const [errors, setErrors]       = useState({})

  const load = () => resourcesAPI.getAll({ 
      type: filterType || undefined, 
      status: filterStatus || undefined,
      capacity: filterCapacity ? parseInt(filterCapacity) : undefined 
    }).then(setResources).catch(() => {}).finally(() => setLoading(false))

  useEffect(() => { load() }, [filterType, filterStatus, filterCapacity])

  const openCreate = () => { setForm({ name:'', type:'ROOM', location:'', capacity:'', description:'', availabilityWindows:'', status:'ACTIVE' }); setErrors({}); setModal('create') }
  const openEdit   = r  => { setForm({ ...r, capacity: String(r.capacity) }); setErrors({}); setModal(r) }
  const closeModal = () => { setModal(null); setErrors({}); }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name || !form.name.trim()) newErrors.name = 'Resource name is required'
    if (!form.location) newErrors.location = 'Location is required'
    if (!form.capacity) newErrors.capacity = 'Capacity is required'
    else if (parseInt(form.capacity) <= 0) newErrors.capacity = 'Capacity must be greater than 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return }
    setSaving(true)
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) }
      if (modal === 'create') { await resourcesAPI.create(payload); toast.success('Resource created!') }
      else                    { await resourcesAPI.update(modal.id, payload); toast.success('Resource updated!') }
      closeModal(); load()
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    setDeleting(id)
    try { await resourcesAPI.delete(id); toast.success('Resource deleted'); load() } catch {} finally { setDeleting(null) }
  }

  const filtered = resources.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  )

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['ID', 'Name', 'Type', 'Location', 'Capacity', 'Availability', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(r => [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.type,
        `"${r.location.replace(/"/g, '""')}"`,
        r.capacity,
        `"${r.availabilityWindows ? r.availabilityWindows.replace(/"/g, '""') : ''}"`,
        r.status,
        `"${r.description ? r.description.replace(/"/g, '""') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resources_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Facilities & Assets</h1>
          <p className="page-subtitle">Manage and book campus resources for your activities.</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={exportCSV} className="btn btn-outline" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <Download size={16}/> Export CSV
            </button>
            <button onClick={openCreate} className="btn btn-primary">
              <Plus size={16}/> Add New Asset
            </button>
          </div>
        )}
      </div>

      {/* Standardized Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:32, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div className="input-wrapper" style={{ flex:1, minWidth:250 }}>
          <Search size={16} className="input-icon" />
          <input className="form-input input-with-icon" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width:'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Categories</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Availability</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Maintenance</option>
        </select>
        <input 
          className="form-input" 
          type="number" 
          min="1"
          placeholder="Min Capacity" 
          style={{ width: '130px' }} 
          value={filterCapacity} 
          onChange={e => setFilterCapacity(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner spinner-lg" />
          <p>Loading facilities...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="stat-card" style={{ padding: 80, textAlign: 'center', opacity: 0.6, background: 'transparent', border: '2px dashed var(--border)' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3>No assets found</h3>
          <p>We couldn't find any resources matching your current filters.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
          {filtered.map(r => (
            <div key={r.id} className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header Visual */}
              <div style={{ height: 60, background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
                 <div className="stat-icon" style={{ width: 36, height: 36, background: 'var(--primary-light)' }}>
                    <Building2 size={18} color="var(--primary-dark)" />
                 </div>
                 <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge ${r.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                      {r.status.replace(/_/g,' ')}
                    </span>
                 </div>
              </div>

                {r.status === 'OUT_OF_SERVICE' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle size={14} /> This facility is currently down for maintenance.
                  </div>
                )}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{r.name}</h3>
                  {(r.updatedAt || r.createdAt) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Clock3 size={12} /> {timeAgo(r.updatedAt || r.createdAt)}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <MapPin size={14}/> {r.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Users size={14}/> {r.capacity} Seats
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Info size={14}/> {r.type}
                  </div>
                  {r.availabilityWindows && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                      <Clock size={14}/> {r.availabilityWindows}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, minHeight: 44 }}>
                  {r.description || 'No detailed description available for this facility.'}
                </p>

                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                  <button 
                    onClick={() => navigate('/bookings')} 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '10px' }}
                    disabled={r.status !== 'ACTIVE'}
                  >
                    Check Schedule
                  </button>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(r)} className="btn btn-success" style={{ padding: 10 }}>
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)} 
                        className="btn btn-danger" 
                        style={{ padding: 10 }}
                        disabled={deleting === r.id}
                      >
                        {deleting === r.id ? <div className="spinner" /> : <Trash2 size={16}/>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Add New Facility' : 'Update Resource Details'}</h3>
              <button onClick={closeModal} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="form-group">
                <label className="form-label">Resource Name *</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => { setForm(f=>({...f,name:e.target.value})); if(errors.name) setErrors(err=>({...err, name:null})) }} placeholder="e.g. Grand Auditorium" />
                {errors.name && <div className="form-error-msg">{errors.name}</div>}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                    <option value="ACTIVE">Active / Available</option>
                    <option value="OUT_OF_SERVICE">Under Maintenance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <select className={`form-select ${errors.location ? 'error' : ''}`} value={form.location} onChange={e => { setForm(f=>({...f,location:e.target.value})); if(errors.location) setErrors(err=>({...err, location:null})) }}>
                    <option value="" disabled>Choose Floor/Zone</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  {errors.location && <div className="form-error-msg">{errors.location}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (Persons) *</label>
                  <input className={`form-input ${errors.capacity ? 'error' : ''}`} type="number" min="1" value={form.capacity} onChange={e => { setForm(f=>({...f,capacity:e.target.value})); if(errors.capacity) setErrors(err=>({...err, capacity:null})) }} placeholder="100" />
                  {errors.capacity && <div className="form-error-msg">{errors.capacity}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Availability Windows</label>
                <input className="form-input" value={form.availabilityWindows} onChange={e => setForm(f=>({...f,availabilityWindows:e.target.value}))} placeholder="e.g. Mon-Fri 08:00-18:00" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="List amenities, rules, or equipment available..." />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ minWidth: 140 }}>
                {saving ? <div className="spinner" /> : (modal === 'create' ? 'Create Asset' : 'Update Asset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
