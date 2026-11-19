import { vi } from 'vitest'
import { apiData, apiRequest } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiData: vi.fn(), apiRequest: vi.fn() }))

describe('authApi', () => {
  it('login', () => {
    login({ username: 'a', password: 'b' })
    expect(apiData).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { username: 'a', password: 'b' } })
  })

  it('register', () => {
    register({ username: 'a' })
    expect(apiData).toHaveBeenCalledWith('/api/auth/register', { method: 'POST', body: { username: 'a' } })
  })

  it('logout', () => {
    logout()
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST', auth: true })
  })

  it('getProfile', () => {
    getProfile()
    expect(apiData).toHaveBeenCalledWith('/api/auth/profile', { auth: true })
  })
})
