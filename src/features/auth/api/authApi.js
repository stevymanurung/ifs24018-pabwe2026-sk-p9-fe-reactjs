import { apiData, apiRequest } from '../../../helpers/apiHelper'

export const login = (payload) => apiData('/api/auth/login', { method: 'POST', body: payload })

export const register = (payload) => apiData('/api/auth/register', { method: 'POST', body: payload })

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST', auth: true })

export const getProfile = () => apiData('/api/auth/profile', { auth: true })
