import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL,
  timeout: 60000,
})

let token = ''
let onUnauthorized = null

client.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof onUnauthorized === 'function') {
      onUnauthorized()
    }
    return Promise.reject(err)
  }
)

export const api = {
  setToken: (t) => {
    token = t || ''
  },
  setOnUnauthorized: (cb) => {
    onUnauthorized = cb
  },
  get: async (path, config) => {
    const res = await client.get(path, config)
    return res.data
  },
  post: async (path, body, config) => {
    const res = await client.post(path, body, config)
    return res.data
  },
  put: async (path, body, config) => {
    const res = await client.put(path, body, config)
    return res.data
  },
  del: async (path, config) => {
    const res = await client.delete(path, config)
    return res.data
  },
}

