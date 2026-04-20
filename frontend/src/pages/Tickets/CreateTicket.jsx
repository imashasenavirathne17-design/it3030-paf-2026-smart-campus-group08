import React, { useState, useRef } from 'react'
import { MdTitle, MdCategory, MdPriorityHigh, MdLocationOn, MdDescription, MdCloudUpload, MdClose } from 'react-icons/md'
import ticketService from '../../services/ticketService'
import toast from 'react-hot-toast'

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
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Report New Incident</h3>
          <button className="btn-ghost" onClick={onClose}><MdClose size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-direction-column gap-5">
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <div style={{ position: 'relative' }}>
              <MdTitle style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="Briefly describe the issue..."
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4">
             <div className="form-group w-full">
               <label className="form-label">Category</label>
               <select 
                 className="form-select" 
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
             <div className="form-group w-full">
               <label className="form-label">Priority</label>
               <select 
                 className="form-select" 
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
            <label className="form-label">Location / Room Number</label>
            <div style={{ position: 'relative' }}>
              <MdLocationOn style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. Building B, Room 302"
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea 
               className="form-textarea" 
               placeholder="Provide as much detail as possible..."
               required
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Evidence Photos (Max 3)</label>
            <div 
              className="glass-card flex flex-direction-column items-center justify-center" 
              style={{ padding: '32px', borderStyle: 'dashed', cursor: 'pointer' }}
              onClick={() => fileInputRef.current.click()}
            >
              <MdCloudUpload size={40} className="text-teal mb-2" />
              <p className="text-sm font-bold">Click to upload images</p>
              <p className="text-xs text-muted">JPG, PNG up to 5MB</p>
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
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                    />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--coral-500)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}
                    >
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTicket
