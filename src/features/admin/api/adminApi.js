import { apiList } from '../../../helpers/apiHelper'

export const fetchUsers = () => apiList('/api/admin/users', { auth: true })

export const fetchAllPosts = () => apiList('/api/admin/posts', { auth: true })

export const fetchUserPosts = (id) => apiList(`/api/admin/users/${id}/posts`, { auth: true })
