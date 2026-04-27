import api from './api'

const ticketService = {
  create: (data, images) => {
    const formData = new FormData()
    formData.append('ticket', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (images && images.length > 0) {
      images.forEach(img => formData.append('images', img))
    }
    return api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getAll: () => api.get('/tickets'),
  getMyTickets: () => api.get('/tickets/my'),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, statusData) => api.patch(`/tickets/${id}/status`, statusData),
  assign: (id, technicianId) => api.patch(`/tickets/${id}/assign`, { technicianId }),
  delete: (id) => api.delete(`/tickets/${id}`),
  
  // Comments
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  deleteComment: (commentId) => api.delete(`/tickets/comments/${commentId}`),
}

export default ticketService
