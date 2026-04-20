import api from './api'

const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'), // Admin
  approveOrReject: (id, data) => api.put(`/bookings/${id}/approval`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}

export default bookingService
