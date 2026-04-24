import api from './api'

const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  updateStatus: (id, status) => api.patch(`/resources/${id}/status`, null, { params: { status } }),
}

export default resourceService
