import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ticketsAPI } from '../../api/tickets'
import { resourcesAPI } from '../../api/resources'
import { Plus, Search, Eye, Edit2, Trash2, Clock, Download, CheckSquare, Square, Filter, ChevronDown, AlertTriangle, User } from 'lucide-react'
import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['ELECTRICAL','PLUMBING','IT','HVAC','FURNITURE','CLEANING','SECURITY','OTHER']
const PRIORITIES  = ['LOW','MEDIUM','HIGH','CRITICAL']
const STATUSES    = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']
const STATUS_COLOR = { OPEN:'#3b82f6', IN_PROGRESS:'#FF8C42', RESOLVED:'#22c55e', CLOSED:'#94a3b8', REJECTED:'#ef4444' }
const PRIORITY_COLOR = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#FF8C42', CRITICAL:'#ef4444' }

export default function Tickets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userRole = (user?.role || '').toUpperCase()
  const isTech  = userRole === 'TECHNICIAN'
  const isAdmin = userRole === 'ADMIN'
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [view, setView]       = useState('kanban')
  const [modal, setModal]     = useState(null) // null, 'create', or ticket object
  const [saving, setSaving]   = useState(false)
  const [images, setImages]   = useState([])
  const [form, setForm] = useState({ title:'', description:'', category:'IT', priority:'MEDIUM', location:'', preferredContactDetails:'' })
  const [locations, setLocations] = useState([])
  const [selectedTickets, setSelectedTickets] = useState([])
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const load = () => {
    ticketsAPI.getAll().then(setTickets).catch(() => {})
    resourcesAPI.getAll().then(res => {
      const locs = [...new Set(res.map(r => r.location).filter(l => l))].sort()
      setLocations(locs)
    }).catch(() => {})
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - images.length)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setImages(prev => [...prev, ev.target.result].slice(0,3))
      reader.readAsDataURL(file)
    })
  }

  const openEdit = (t) => {
    setForm({ title: t.title, description: t.description, category: t.category, priority: t.priority, location: t.location || '', preferredContactDetails: t.preferredContactDetails || '' })
    setImages(t.images || [])
    setModal(t)
  }

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      if (modal === 'create') {
        await ticketsAPI.create({ ...form, images })
        toast.success('Ticket submitted!')
      } else {
        await ticketsAPI.update(modal.id, { ...form, images })
        toast.success('Ticket updated!')
      }
      setModal(null)
      setForm({ title:'', description:'', category:'IT', priority:'MEDIUM', location:'', preferredContactDetails:'' })
      setImages([])
      load()
    } catch {} finally { setSaving(false) }
  }

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 
      'Submitted By', 'Assigned To', 'Created At', 'SLA Deadline', 
      'Description', 'Preferred Contact', 'Resolution Notes', 'Rejection Reason'
    ]

    const rows = tickets.map(t => [
      t.id,
      t.title,
      t.category,
      t.priority,
      t.status,
      t.location || 'N/A',
      t.submittedByName,
      t.assignedToName || 'Unassigned',
      t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A',
      t.slaDeadline ? new Date(t.slaDeadline + 'Z').toLocaleString() : 'N/A',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.preferredContactDetails || '').replace(/"/g, '""')}"`,
      `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`,
      `"${(t.rejectionReason || '').replace(/"/g, '""')}"`
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `tickets_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported successfully')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return
    try {
      await ticketsAPI.delete(id)
      toast.success('Ticket deleted')
      load()
    } catch {}
  }

  const filtered = tickets.filter(t =>
    (t.title.toLowerCase().includes(search.toLowerCase()) || (t.category||'').toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || t.status === filterStatus) &&
    (!filterPriority || t.priority === filterPriority) &&
    (!filterCategory || t.category === filterCategory)
  )
  const grouped = STATUSES.reduce((acc, s) => ({ ...acc, [s]: filtered.filter(t => t.status === s) }), {})

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg" /></div>

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1 className="page-title">Maintenance & Tickets</h1><p className="page-subtitle">Report and track campus maintenance issues.</p></div>
        <div style={{ display:'flex', gap:10 }}>
          <div className="tabs">
            <button className={`tab ${view==='kanban'?'active':''}`} onClick={() => setView('kanban')}>Kanban</button>
            <button className={`tab ${view==='list'?'active':''}`} onClick={() => setView('list')}>List</button>
          </div>
          {isAdmin && (
            <button onClick={handleExportCSV} className="btn btn-outline" title="Export to CSV">
              <Download size={16}/> Export CSV
            </button>
          )}
          <button onClick={() => setModal('create')} className="btn btn-primary"><Plus size={16}/>New Ticket</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft:36 }} placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width:'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Admin Workload Summary */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {Array.from(new Set(tickets.map(t => t.assignedToName).filter(n => n))).map(name => {
            const count = tickets.filter(t => t.assignedToName === name && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(t.status)).length;
            return (
              <div key={name} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon" style={{ width: 40, height: 40, background: 'var(--primary-light)' }}>
                  <User size={20} color="var(--primary-dark)"/>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{count} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>Active</span></div>
                </div>
              </div>
            )
          })}
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, border: '1px dashed var(--border)', background: 'transparent' }}>
             <div className="stat-icon" style={{ width: 40, height: 40, background: 'var(--bg-alt)' }}>
               <AlertTriangle size={20} color="var(--text-muted)"/>
             </div>
             <div>
               <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Unassigned</div>
               <div style={{ fontSize: 18, fontWeight: 700 }}>{tickets.filter(t => !t.assignedToId && t.status === 'OPEN').length} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>Pending</span></div>
             </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' ? (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <span style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLOR[status] }} />
                {status.replace('_',' ')}
                <span className="badge badge-gray" style={{ marginLeft:'auto', fontSize:11 }}>{grouped[status].length}</span>
              </div>
              {grouped[status].length === 0 && <div style={{ fontSize:13, color:'var(--text-muted)', padding:'16px 0', textAlign:'center' }}>No tickets</div>}
              {grouped[status].map(t => (
                <div key={t.id} className="kanban-card" onClick={() => navigate(`/tickets/${t.id}`)}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:PRIORITY_COLOR[t.priority], background:`${PRIORITY_COLOR[t.priority]}20`, padding:'2px 7px', borderRadius:99 }}>{t.priority}</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{t.category}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</div>
                  {t.images?.length > 0 && <div style={{ fontSize:11, color:'var(--primary-dark)', marginTop:6 }}>📎 {t.images.length} image(s)</div>}
                  {t.slaDeadline && !['RESOLVED', 'CLOSED'].includes(t.status) && (
                    <div style={{ 
                      fontSize:11, 
                      color: isPast(parseISO(t.slaDeadline + 'Z')) ? 'var(--danger)' : 'var(--text-muted)', 
                      marginTop:6, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4 
                    }}>
                      <Clock size={12} />
                      {isPast(parseISO(t.slaDeadline + 'Z')) ? 'SLA Breached' : `SLA: ${formatDistanceToNow(parseISO(t.slaDeadline + 'Z'))} left`}
                    </div>
                  )}
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>By {t.submittedByName}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper card">
          <table style={{ position: 'relative' }}>
             <thead>
               <tr>
                 {isAdmin && (
                   <th style={{ width: 40 }}>
                     <button style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setSelectedTickets(selectedTickets.length === filtered.length ? [] : filtered.map(t => t.id))}>
                       {selectedTickets.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} color="var(--primary)"/> : <Square size={18} color="var(--text-muted)" strokeWidth={1.5}/>}
                     </button>
                   </th>
                 )}
                 <th>Title</th><th>Category</th><th>Priority</th><th>SLA</th><th>Location</th><th>Status</th><th>Submitted By</th><th>Action</th>
               </tr>
             </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No tickets found</td></tr>
                : filtered.map(t => (
                  <tr key={t.id} className={selectedTickets.includes(t.id) ? 'row-selected' : ''}>
                    {isAdmin && (
                      <td>
                        <button style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTickets(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])
                        }}>
                          {selectedTickets.includes(t.id) ? <CheckSquare size={18} color="var(--primary)"/> : <Square size={18} color="var(--text-muted)" strokeWidth={1.5}/>}
                        </button>
                      </td>
                    )}
                    <td><strong>{t.title}</strong></td>
                    <td><span className="badge badge-gray">{t.category}</span></td>
                    <td><span style={{ color:PRIORITY_COLOR[t.priority], fontWeight:700, fontSize:13 }}>{t.priority}</span></td>
                    <td>
                      {t.slaDeadline && !['RESOLVED', 'CLOSED'].includes(t.status) ? (
                        <span style={{ fontSize: 12, color: isPast(parseISO(t.slaDeadline + 'Z')) ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isPast(parseISO(t.slaDeadline + 'Z')) ? 700 : 500 }}>
                          {isPast(parseISO(t.slaDeadline + 'Z')) ? 'Breached' : `${formatDistanceToNow(parseISO(t.slaDeadline + 'Z'))}`}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td><span style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>{t.location || 'N/A'}</span></td>
                    <td><span className="badge" style={{ background:`${STATUS_COLOR[t.status]}20`, color:STATUS_COLOR[t.status] }}>{t.status}</span></td>
                    <td>{t.submittedByName}</td>
                    <td>{t.assignedToName || <span style={{ color:'var(--text-muted)' }}>Unassigned</span>}</td>
                     <td>
                       <div style={{ display:'flex', gap:8 }}>
                         <button onClick={() => navigate(`/tickets/${t.id}`)} className="btn btn-ghost btn-sm" title={isTech ? "Manage" : "View"}>
                           <Eye size={14}/> {isTech ? "Manage" : "View"}
                         </button>
                         
                         {/* Admin: Full Control | Student: Own tickets only */}
                         {(isAdmin || ((String(user?.id) === String(t.submittedBy) || user?.name === t.submittedByName) && t.status === 'OPEN')) && (
                           <>
                             <button onClick={() => openEdit(t)} className="btn btn-primary btn-sm" style={{ display:'flex', alignItems:'center', gap:4, background:'#10B981', borderColor:'#10B981', color:'#fff' }}>
                               <Edit2 size={14}/> Edit
                             </button>
                             <button onClick={() => handleDelete(t.id)} className="btn btn-danger btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>
                               <Trash2 size={14}/> Delete
                             </button>
                           </>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {isAdmin && selectedTickets.length > 0 && (
        <div className="bulk-toolbar animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 600 }}>{selectedTickets.length} Selected</span>
            <div className="divider-v" />
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-select btn-sm" onChange={async (e) => {
                if (!e.target.value) return
                if (window.confirm(`Update ${selectedTickets.length} tickets to ${e.target.value}?`)) {
                  await ticketsAPI.bulkUpdateStatus({ ids: selectedTickets, status: e.target.value })
                  toast.success('Status updated')
                  setSelectedTickets([])
                  load()
                }
              }} value="">
                <option value="">Update Status...</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
              <button className="btn btn-danger btn-sm" onClick={async () => {
                if (window.confirm(`Delete ${selectedTickets.length} tickets permanently?`)) {
                  await ticketsAPI.bulkDelete(selectedTickets)
                  toast.success('Tickets deleted')
                  setSelectedTickets([])
                  load()
                }
              }}>
                <Trash2 size={14}/> Delete
              </button>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTickets([])}>Cancel</button>
        </div>
      )}

      {/* Create Modal */}
       {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h3>{modal === 'create' ? 'Report New Issue' : 'Edit Issue'}</h3>
               <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Brief issue description" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                 <label className="form-label">Location</label>
                 <select className="form-select" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))}>
                   <option value="">Select Location</option>
                   {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                   <option value="Other">Other</option>
                 </select>
               </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the issue in detail..." />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Contact Details (Phone/Email)</label>
                <input className="form-input" value={form.preferredContactDetails} onChange={e => setForm(f=>({...f,preferredContactDetails:e.target.value}))} placeholder="e.g. Call 0771234567 or email user@test.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Images (max 3)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display:'none' }} id="img-upload" />
                <label htmlFor="img-upload" className="btn btn-outline" style={{ cursor:'pointer', justifyContent:'flex-start' }}>📎 Attach Images ({images.length}/3)</label>
                {images.length > 0 && (
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    {images.map((img,i) => (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={img} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />
                        <button onClick={() => setImages(prev => prev.filter((_,j) => j!==i))} style={{ position:'absolute', top:-6, right:-6, background:'var(--danger)', color:'white', border:'none', borderRadius:'50%', width:18, height:18, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
             <div className="modal-footer">
               <button onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
               <button onClick={handleCreate} className="btn btn-primary" disabled={saving}>
                 {saving ? <div className="spinner" /> : (modal === 'create' ? 'Submit Ticket' : 'Save Changes')}
               </button>
             </div>
          </div>
        </div>
      )}
      <style>{`
        .row-selected { background: rgba(59, 130, 246, 0.05) !important; }
        .bulk-toolbar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 12px 24px;
          border-radius: 99px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          border: 1px solid var(--primary);
          display: flex;
          align-items: center;
          gap: 24px;
          z-index: 1000;
        }
        .divider-v { width: 1px; height: 24px; background: var(--border); }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
