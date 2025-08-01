import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  // baseURL: 'https://bank-backend-dhju.onrender.com',
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { code, expired } = error.response.data || {}
      if (code === 'TOKEN_EXPIRED' || code === 'MISSING_TOKEN' || expired) {
        Cookies.remove('authToken')
        alert('Session expired. Please login again.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    }
    return Promise.reject(error)
  },
)

export default api
