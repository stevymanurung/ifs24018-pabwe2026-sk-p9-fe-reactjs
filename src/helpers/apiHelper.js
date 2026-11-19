import { getToken } from './sessionHelper'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) headers.Authorization = `Bearer ${getToken()}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server', 0)
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.status !== 'success') {
    throw new ApiError(json.message || 'Terjadi kesalahan pada server', res.status)
  }
  return json
}

export const apiData = async (path, options) => (await apiRequest(path, options)).data

export const apiList = async (path, options) => (await apiRequest(path, options)).data || []
