import api from './axiosInstance'

export const ticketsAPI = {
  getAll:      ()           => api.get('/tickets').then(r => r.data),
  getById:     (id)         => api.get(`/tickets/${id}`).then(r => r.data),
  create:      (data)       => api.post('/tickets', data).then(r => r.data),
  update:      (id, data)   => api.put(`/tickets/${id}`, data).then(r => r.data),
  addComment:  (id, data)   => api.post(`/tickets/${id}/comments`, data).then(r => r.data),
  updateComment:(id, cId, data)=> api.put(`/tickets/${id}/comments/${cId}`, data).then(r => r.data),
  deleteComment:(id, cId)     => api.delete(`/tickets/${id}/comments/${cId}`).then(r => r.data),
  delete:      (id)         => api.delete(`/tickets/${id}`).then(r => r.data),
  submitFeedback: (id, data) => api.post(`/tickets/${id}/feedback`, data).then(r => r.data),
  bulkDelete: (ids) => api.delete('/tickets/bulk', { data: ids }).then(r => r.data),
  bulkUpdateStatus: (data) => api.put('/tickets/bulk/status', data).then(r => r.data),
}
