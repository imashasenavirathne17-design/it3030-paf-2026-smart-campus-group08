import { useState, useEffect } from 'react'
import { usersAPI } from '../api/users'
import toast from 'react-hot-toast'
import { Shield, ShieldAlert, ShieldCheck, Edit2, Trash2, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole)
      toast.success('Role updated successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account')
      return
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await usersAPI.delete(userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleUpdate = async () => {
    if (!editUser.name) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      await usersAPI.update(editUser.id, { name: editUser.name, role: editUser.role })
      toast.success('User updated successfully')
      setEditUser(null)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck size={16} color="#B794F4" />
      case 'TECHNICIAN': return <ShieldAlert size={16} color="#FBBF24" />
      default: return <Shield size={16} color="#76C8C8" />
    }
  }

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:100 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <p style={styles.subtitle}>Manage platform access and assign roles to registered users.</p>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Current Role</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <img 
                      src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F4F7F9&color=1E293B`} 
                      alt="" style={styles.avatar} 
                    />
                    <span style={styles.name}>{user.name}</span>
                  </div>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <div style={styles.roleBadge}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <select 
                      style={styles.select}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    
                    <button 
                      onClick={() => setEditUser(user)}
                      className="btn btn-success" 
                      style={{ padding: '6px 16px', fontSize: 13, borderRadius: 999 }}
                    >
                      <Edit2 size={14}/> Edit
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger" 
                      style={{ padding: '6px 16px', fontSize: 13, borderRadius: 999 }}
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 size={14}/> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div style={styles.empty}>No users found.</div>}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setEditUser(null)} className="btn btn-ghost btn-icon"><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  value={editUser.name} 
                  onChange={e => setEditUser(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select 
                  className="form-select" 
                  value={editUser.role} 
                  onChange={e => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditUser(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleUpdate} className="btn btn-primary" disabled={saving}>
                {saving ? <div className="spinner" /> : <><Check size={16}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'var(--text-secondary)' },
  card: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-soft)',
    overflow: 'hidden',
    border: '1px solid var(--border)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { 
    textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 700, 
    color: 'var(--text-secondary)', textTransform: 'uppercase', 
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-alt)'
  },
  tr: { borderBottom: '1px solid #F1F5F9', transition: 'var(--transition)' },
  td: { padding: '16px 24px', fontSize: 14, color: 'var(--text-primary)', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' },
  name: { fontWeight: 600 },
  roleBadge: { 
    display: 'inline-flex', alignItems: 'center', gap: 6, 
    padding: '6px 12px', background: 'var(--bg-alt)', borderRadius: '8px', 
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' 
  },
  select: {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
    background: '#FFFFFF', fontSize: 13, color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none'
  },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }
}
