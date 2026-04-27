import api from './axiosInstance'

export const authAPI = {
  login:       (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  register:    (data)        => api.post('/auth/register', data).then(r => r.data),
  googleLogin: (token)       => api.post('/auth/google', { token }).then(r => r.data),
  getMe:       ()            => api.get('/auth/me').then(r => r.data),
  updateRole:  (role)        => api.put('/auth/me/role', { role }).then(r => r.data),
}
