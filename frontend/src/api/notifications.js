import api from './axiosInstance'

export const notificationsAPI = {
  getAll:       ()    => api.get('/notifications').then(r => r.data),
  getUnreadCount: ()  => api.get('/notifications/unread-count').then(r => r.data),
  markRead:     (id)  => api.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead:  ()    => api.put('/notifications/read-all').then(r => r.data),
  delete:       (id)  => api.delete(`/notifications/${id}`).then(r => r.data),
  deleteAll:    ()    => api.delete('/notifications/clear-all').then(r => r.data),
  broadcast:    (data)=> api.post('/notifications/broadcast', data).then(r => r.data),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats').then(r => r.data),
}
