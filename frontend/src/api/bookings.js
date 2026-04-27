import api from './axiosInstance'

export const bookingsAPI = {
  getAll:    ()       => api.get('/bookings').then(r => r.data),
  getById:   (id)     => api.get(`/bookings/${id}`).then(r => r.data),
  create:    (data)   => api.post('/bookings', data).then(r => r.data),
  approve:   (id)     => api.put(`/bookings/${id}/approve`).then(r => r.data),
  reject:    (id, rejectReason) => api.put(`/bookings/${id}/reject`, null, { params: { rejectReason } }).then(r => r.data),
  cancel:    (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }).then(r => r.data),
  acceptCancel: (id) => api.put(`/bookings/${id}/cancel/accept`).then(r => r.data),
  rejectCancel: (id) => api.put(`/bookings/${id}/cancel/reject`).then(r => r.data),
  delete:    (id)     => api.delete(`/bookings/${id}`).then(r => r.data),
  update:    (id, data) => api.put(`/bookings/${id}`, data).then(r => r.data),
  checkIn:   (id)     => api.put(`/bookings/${id}/checkin`).then(r => r.data),
  collect:   (id)     => api.put(`/bookings/${id}/collect`).then(r => r.data),
  returnEquipment: (id) => api.put(`/bookings/${id}/return`).then(r => r.data),
}
