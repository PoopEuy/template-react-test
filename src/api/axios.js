import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export const apiProducts = axios.create({
  baseURL: `${API_BASE}/products`,
})

export const apiAuth = axios.create({
  baseURL: `${API_BASE}/auth`,
})
