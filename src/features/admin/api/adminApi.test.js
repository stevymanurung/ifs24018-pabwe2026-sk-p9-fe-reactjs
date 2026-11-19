import { vi } from 'vitest'
import { apiList } from '../../../helpers/apiHelper'
import { fetchAllPosts, fetchUserPosts, fetchUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiList: vi.fn() }))

describe('adminApi', () => {
  it('memanggil endpoint admin', () => {
    fetchUsers()
    expect(apiList).toHaveBeenLastCalledWith('/api/admin/users', { auth: true })
    fetchAllPosts()
    expect(apiList).toHaveBeenLastCalledWith('/api/admin/posts', { auth: true })
    fetchUserPosts(7)
    expect(apiList).toHaveBeenLastCalledWith('/api/admin/users/7/posts', { auth: true })
  })
})
