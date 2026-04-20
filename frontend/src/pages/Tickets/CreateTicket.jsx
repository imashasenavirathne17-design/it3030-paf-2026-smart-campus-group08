import React, { useState, useRef } from 'react'
import { MdTitle, MdCategory, MdPriorityHigh, MdLocationOn, MdDescription, MdCloudUpload, MdClose } from 'react-icons/md'
import ticketService from '../../services/ticketService'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const CreateTicket = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    location: '',
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed')
      return
    }
    setImages([...images, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ticketService.create(formData, images)
      toast.success('Ticket submitted successfully!')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error('Failed to submit ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '600px', width: '95%', padding: '32px', position: 'relative' }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <MdClose size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Report Incident</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Provide details about the issue you encountered.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Issue Title</label>
            <div style={{ position: 'relative' }}>
              <MdTitle style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '44px', background: 'var(--bg-app)', border: 'none' }}
                placeholder="Briefly describe the issue..."
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="form-group">
               <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Category</label>
               <select 
                 className="form-select" 
                 style={{ background: 'var(--bg-app)', border: 'none' }}
                 required
                 value={formData.category}
                 onChange={e => setFormData({...formData, category: e.target.value})}
               >
                 <option value="ELECTRICAL">Electrical</option>
                 <option value="PLUMBING">Plumbing</option>
                 <option value="IT_SUPPORT">IT Support</option>
                 <option value="CLEANING">Cleaning</option>
                 <option value="SECURITY">Security</option>
                 <option value="HVAC">HVAC</option>
                 <option value="FURNITURE">Furniture</option>
                 <option value="OTHER">Other</option>
               </select>
             </div>
             <div className="form-group">
               <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Priority</label>
               <select 
                 className="form-select" 
                 style={{ background: 'var(--bg-app)', border: 'none' }}
                 required
                 value={formData.priority}
                 onChange={e => setFormData({...formData, priority: e.target.value})}
               >
                 <option value="LOW">Low</option>
                 <option value="MEDIUM">Medium</option>
                 <option value="HIGH">High</option>
                 <option value="CRITICAL">Critical</option>
               </select>
             </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Location / Room</label>
            <div style={{ position: 'relative' }}>
              <MdLocationOn style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '44px', background: 'var(--bg-app)', border: 'none' }}
                placeholder="e.g. Building B, Room 302"
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Detailed Description</label>
            <textarea 
               className="form-textarea" 
               style={{ background: 'var(--bg-app)', border: 'none', borderRadius: '12px', minHeight: '100px' }}
               placeholder="Provide as much detail as possible..."
               required
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Evidence Photos (Max 3)</label>
            <div 
              style={{ 
                background: 'var(--bg-app)', 
                padding: '24px', 
                borderRadius: '16px', 
                border: '2px dashed #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
              onClick={() => fileInputRef.current.click()}
            >
              <MdCloudUpload size={32} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Click to upload images</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JPG, PNG up to 5MB</p>
              <input 
                type="file" 
                hidden 
                multiple 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {images.length > 0 && (
              <div className="flex gap-3 mt-4">
                {images.map((file, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--coral)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    >
                      <MdClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-2">
            <button type="button" className="btn btn-pill bg-gray-100 w-full" style={{ background: '#f3f4f6' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-pill shadow-sm w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Report Incident'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateTicket
