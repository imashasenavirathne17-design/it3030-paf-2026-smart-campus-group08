import api from './axiosInstance'

export const usersAPI = {
  getAll: () => api.get('/users').then(r => r.data),
  getTechnicians: () => api.get('/users/technicians').then(r => r.data),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }).then(r => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
  updatePreferences: (id, prefs) => api.put(`/users/${id}/preferences`, prefs).then(r => r.data)
}
