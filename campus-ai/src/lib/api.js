import axios from 'axios'

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
//
//  Local dev  →  uses http://localhost:8080/api  (no env file needed)
//  Vercel     →  set VITE_API_BASE in Vercel dashboard:
//                  Environment Variables → VITE_API_BASE
//                  Value: https://your-app.onrender.com/api
// ─────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,  // Render free tier can cold-start in ~30s on first request
})

// Intercept every error response and attach a clean human-readable message
api.interceptors.response.use(
  res => res,
  err => {
    const data  = err?.response?.data
    const status = err?.response?.status
    let message = 'An unexpected error occurred.'

    if (typeof data === 'string' && data.trim()) {
      message = data.trim()
    } else if (data?.message) {
      message = data.message
    } else if (status === 400) {
      message = 'Bad request — please check your inputs.'
    } else if (status === 404) {
      message = 'Resource not found on the server.'
    } else if (status === 500) {
      message = 'Server error — please try again later.'
    } else if (!err.response) {
      message = 'Cannot reach the server. It may be starting up — please wait a moment and retry.'
    }

    err.uiMessage = message
    return Promise.reject(err)
  }
)

export const resourcesApi = {
  getAll: () => api.get('/resources').then(r => r.data),

  allocate: (resId, deptId, date) =>
    api.post('/allocate', null, {
      params: { resId, deptId, date },
      responseType: 'text',
    }).then(r => r.data),

  release: (resId) =>
    api.post('/release', null, {
      params: { resId },
      responseType: 'text',
    }).then(r => r.data),
}

export default api
