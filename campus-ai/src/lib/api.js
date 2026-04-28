import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  withCredentials: true,   // required for session cookies (auth)
})

api.interceptors.response.use(
  res => res,
  err => {
    const data   = err?.response?.data
    const status = err?.response?.status
    let message  = 'An unexpected error occurred.'

    if (data?.message)                              message = data.message
    else if (typeof data === 'string' && data.trim()) message = data.trim()
    else if (status === 400) message = 'Bad request — check your inputs.'
    else if (status === 401) message = 'Please log in first.'
    else if (status === 403) message = 'Admin access required.'
    else if (status === 404) message = 'Not found on the server.'
    else if (status === 500) message = 'Server error — try again later.'
    else if (!err.response)  message = 'Cannot reach server. It may be starting up — wait a moment and retry.'

    err.uiMessage = message
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  me:     ()                                               => api.get('/me').then(r => r.data),
  login:  (username, password)                             => api.post('/login',  null, { params: { username, password } }).then(r => r.data),
  signup: (username, password, fullName, department, role) => api.post('/signup', null, { params: { username, password, fullName, department, role } }).then(r => r.data),
  logout: ()                                               => api.post('/logout').then(r => r.data),
}

// ── Resources ─────────────────────────────────────────────────
export const resourcesApi = {
  getAll:   ()                                          => api.get('/resources').then(r => r.data),
  add:      (name, type, location, detail, totalQty)   => api.post('/resources/add',    null, { params: { name, type, location, detail, totalQty } }).then(r => r.data),
  update:   (resId, name, type, location, detail, qty) => api.post('/resources/update', null, { params: { resId, name, type, location, detail, totalQty: qty } }).then(r => r.data),
  remove:   (resId)                                     => api.post('/resources/delete', null, { params: { resId } }).then(r => r.data),
  allocate: (resId, deptId, date, qty = 1)             => api.post('/allocate', null, { params: { resId, deptId, date, qty } }).then(r => r.data),
  release:  (resId, qty = 1)                           => api.post('/release',  null, { params: { resId, qty } }).then(r => r.data),
}

// ── History ───────────────────────────────────────────────────
export const historyApi = {
  getAll: () => api.get('/history').then(r => r.data),
}

// ── Bookings ──────────────────────────────────────────────────
export const bookingsApi = {
  getAll:   ()                                                    => api.get('/bookings').then(r => r.data),
  create:   (resourceId, startDate, endDate, purpose)             => api.post('/bookings/create', null, { params: { resourceId, startDate, endDate, purpose } }).then(r => r.data),
  cancel:   (bookingId)                                           => api.post('/bookings/cancel',  null, { params: { bookingId } }).then(r => r.data),
  approve:  (bookingId)                                           => api.post('/bookings/approve', null, { params: { bookingId } }).then(r => r.data),
}

// ── Insights & Report ─────────────────────────────────────────
export const insightsApi = {
  get:    () => api.get('/insights').then(r => r.data),
  report: () => api.get('/report', { responseType: 'blob' }).then(r => r.data),
}

export default api