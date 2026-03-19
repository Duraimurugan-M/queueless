import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('ql_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    const isAuthRoute = error.config?.url?.includes('/auth/')
    const isOnAuthPage = window.location.pathname.includes('/login') ||
                         window.location.pathname.includes('/register') ||
                         window.location.pathname.includes('/forgot-password')

    if (status === 401) {
      if (!isAuthRoute && !isOnAuthPage) {
        toast.error('Session expired. Please login again.')
        Cookies.remove('ql_token')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('Access denied.')
    } else if (status === 409) {
      // ✅ Show 409 conflict message — e.g. "Prescription already exists for this token"
      toast.error(message)
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status && status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api