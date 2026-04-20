import api from './api'

export const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  updateStatus: (id, status) => api.patch(`/resources/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/resources/${id}`),
}

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  approveOrReject: (id, data) => api.put(`/bookings/${id}/approval`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}

export const ticketService = {
  create: (formData) => api.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/tickets'),
  getMyTickets: () => api.get('/tickets/my'),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
  assign: (id, data) => api.patch(`/tickets/${id}/assign`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  deleteComment: (commentId) => api.delete(`/tickets/comments/${commentId}`),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const userService = {
  getMe: () => api.get('/users/me'),
  updatePreferences: (data) => api.put('/users/me/preferences', data),
  getAll: () => api.get('/users'),
  updateRoles: (id, data) => api.put(`/users/${id}/roles`, data),
}

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
}
