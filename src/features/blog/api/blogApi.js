import { apiData, apiList } from '../../../helpers/apiHelper'

export const fetchPublicPosts = ({ q = '', category = '' } = {}) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return apiList(`/api/public/posts${qs ? `?${qs}` : ''}`)
}

export const fetchPublicPost = (slug) => apiData(`/api/public/posts/${encodeURIComponent(slug)}`)

export const fetchMyPosts = () => apiList('/api/posts', { auth: true })

export const fetchStats = () => apiData('/api/posts/stats', { auth: true })

export const createPost = (payload) => apiData('/api/posts', { method: 'POST', body: payload, auth: true })

export const updatePost = (id, payload) => apiData(`/api/posts/${id}`, { method: 'PUT', body: payload, auth: true })

export const togglePublish = (id) => apiData(`/api/posts/${id}/toggle-publish`, { method: 'PATCH', auth: true })

export const deletePost = (id) => apiData(`/api/posts/${id}`, { method: 'DELETE', auth: true })

export const generateDraft = (payload) =>
  apiData('/api/posts/ai-generate', { method: 'POST', body: payload, auth: true })
