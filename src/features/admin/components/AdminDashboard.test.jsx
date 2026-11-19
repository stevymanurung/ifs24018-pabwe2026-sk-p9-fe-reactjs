import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { fetchAllPosts, fetchUserPosts, fetchUsers } from '../api/adminApi'
import AdminDashboard from './AdminDashboard'

vi.mock('../api/adminApi', () => ({ fetchUsers: vi.fn(), fetchAllPosts: vi.fn(), fetchUserPosts: vi.fn() }))

const users = [
  { id: 1, username: 'admin', email: 'admin@mail.test', role: 'admin', total_articles: 0, total_published: 0 },
  { id: 2, username: 'andi', email: 'andi@mail.test', role: 'member', total_articles: 2, total_published: 1 },
]
const allPosts = [
  { id: 10, title: 'Artikel Satu', author_name: 'andi', category: 'Umum', is_published: true, created_at: '2026-11-01T12:00:00Z' },
  { id: 11, title: 'Artikel Dua', author_name: 'andi', category: 'Bisnis', is_published: false, created_at: '2026-11-02T12:00:00Z' },
]

beforeEach(() => {
  fetchUsers.mockResolvedValue(users)
  fetchAllPosts.mockResolvedValue(allPosts)
  fetchUserPosts.mockResolvedValue([allPosts[0]])
})

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, pengguna, dan arsip artikel', async () => {
    render(<AdminDashboard onSessionExpired={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat data')
    expect(await screen.findByText('andi@mail.test')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Artikel Ditampilkan').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Artikel Terbit').nextSibling).toHaveTextContent('1')
    expect(screen.getByRole('heading', { level: 2, name: 'Seluruh Artikel' })).toBeInTheDocument()
    expect(screen.getByText('Artikel Satu')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Draf' })).toBeInTheDocument()
    expect(document.title).toBe('Admin Panel | Delcom Blog')
  })

  it('memfilter artikel per pengguna lalu menampilkan semua lagi', async () => {
    render(<AdminDashboard onSessionExpired={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lihat artikel andi' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Artikel dari andi' })).toBeInTheDocument()
    expect(fetchUserPosts).toHaveBeenCalledWith(2)
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Seluruh Artikel' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tampilkan semua' })).not.toBeInTheDocument()
  })

  it('menampilkan pesan bila belum ada artikel', async () => {
    fetchAllPosts.mockResolvedValue([])
    render(<AdminDashboard onSessionExpired={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan error', async () => {
    fetchUsers.mockRejectedValue(Object.assign(new Error('Server error'), { status: 500 }))
    const onSessionExpired = vi.fn()
    render(<AdminDashboard onSessionExpired={onSessionExpired} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('mengakhiri sesi saat 401', async () => {
    fetchUsers.mockRejectedValue(Object.assign(new Error('expired'), { status: 401 }))
    const onSessionExpired = vi.fn()
    render(<AdminDashboard onSessionExpired={onSessionExpired} />)
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalled())
  })

  it('mengabaikan hasil setelah unmount', async () => {
    let resolve
    fetchUsers.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const { unmount } = render(<AdminDashboard onSessionExpired={vi.fn()} />)
    unmount()
    await act(async () => resolve(users))
    expect(fetchUsers).toHaveBeenCalledTimes(1)
  })
})
