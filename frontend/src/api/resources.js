import api from './axiosInstance'

export const resourcesAPI = {
  getAll:    (params) => api.get('/resources', { params }).then(r => r.data),
  getById:   (id)     => api.get(`/resources/${id}`).then(r => r.data),
  create:    (data)   => api.post('/resources', data).then(r => r.data),
  update:    (id, d)  => api.put(`/resources/${id}`, d).then(r => r.data),
  delete:    (id)     => api.delete(`/resources/${id}`).then(r => r.data),
}
