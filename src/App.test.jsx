import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { logout } from './features/auth/api/authApi'
import { saveSession } from './helpers/sessionHelper'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', async () => {
  const { createElement: h } = await import('react')
  return { default: () => h('div', null, 'HALAMAN-LIST') }
})
vi.mock('./features/blog/components/PublicArticleDetail', async () => {
  const { createElement: h } = await import('react')
  return { default: ({ slug }) => h('div', null, `HALAMAN-DETAIL:${slug}`) }
})
vi.mock('./features/auth/components/AuthPage', async () => {
  const { createElement: h } = await import('react')
  return {
    default: ({ mode, onSuccess }) =>
      h(
        'div',
        null,
        h('span', null, `HALAMAN-AUTH:${mode}`),
        h('button', { onClick: () => onSuccess({ token: 'tok', user: { id: 1, role: 'member' } }) }, 'login-sukses'),
        h('button', { onClick: () => onSuccess({ token: 'tok', user: { id: 2, role: 'admin' } }) }, 'login-admin'),
      ),
  }
})
vi.mock('./features/blog/components/AuthorDashboard', async () => {
  const { createElement: h } = await import('react')
  return {
    default: ({ onSessionExpired }) =>
      h('div', null, h('span', null, 'HALAMAN-AUTHOR'), h('button', { onClick: onSessionExpired }, 'sesi-habis')),
  }
})
vi.mock('./features/admin/components/AdminDashboard', async () => {
  const { createElement: h } = await import('react')
  return { default: () => h('div', null, 'HALAMAN-ADMIN') }
})

const member = { id: 1, username: 'andi', role: 'member' }
const admin = { id: 2, username: 'admin', role: 'admin' }
const visit = (path) => window.history.pushState({}, '', path)

describe('App routing', () => {
  it('menampilkan beranda, skip link, dan footer', () => {
    render(<App />)
    expect(screen.getByText('HALAMAN-LIST')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lewati ke konten utama' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByText(/© 2026 Delcom Blog/)).toBeInTheDocument()
  })

  it('/public dan /posts/:slug', () => {
    visit('/public')
    const { unmount } = render(<App />)
    expect(screen.getByText('HALAMAN-LIST')).toBeInTheDocument()
    unmount()
    visit('/posts/halo')
    render(<App />)
    expect(screen.getByText('HALAMAN-DETAIL:halo')).toBeInTheDocument()
  })

  it('halaman tidak ditemukan dengan tautan kembali', async () => {
    visit('/tidak-ada')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(document.title).toBe('Halaman tidak ditemukan | Delcom Blog')
    await userEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
    expect(await screen.findByText('HALAMAN-LIST')).toBeInTheDocument()
  })

  it('/login dan /register untuk tamu', () => {
    visit('/login')
    const { unmount } = render(<App />)
    expect(screen.getByText('HALAMAN-AUTH:login')).toBeInTheDocument()
    unmount()
    visit('/register')
    render(<App />)
    expect(screen.getByText('HALAMAN-AUTH:register')).toBeInTheDocument()
  })

  it('tamu yang membuka /author atau /admin dialihkan ke /login', async () => {
    visit('/author')
    const { unmount } = render(<App />)
    expect(await screen.findByText('HALAMAN-AUTH:login')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    unmount()
    visit('/admin')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('token tanpa data user dianggap belum login', async () => {
    localStorage.setItem('delcom_blog_token', 'tok')
    visit('/author')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('member membuka /admin dialihkan ke /author, dan /login ke beranda role', async () => {
    saveSession('tok', member)
    visit('/admin')
    const { unmount } = render(<App />)
    expect(await screen.findByText('HALAMAN-AUTHOR')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    unmount()
    visit('/login')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/author'))
  })

  it('admin dapat membuka /admin', () => {
    saveSession('tok', admin)
    visit('/admin')
    render(<App />)
    expect(screen.getByText('HALAMAN-ADMIN')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
  })

  it('mengikuti popstate peramban', async () => {
    render(<App />)
    act(() => {
      visit('/posts/lain')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(await screen.findByText('HALAMAN-DETAIL:lain')).toBeInTheDocument()
  })
})

describe('App sesi', () => {
  it('login member sukses menyimpan sesi dan menuju /author', async () => {
    visit('/login')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'login-sukses' }))
    expect(await screen.findByText('HALAMAN-AUTHOR')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    expect(localStorage.getItem('delcom_blog_token')).toBe('tok')
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument()
  })

  it('login admin menuju /admin', async () => {
    visit('/login')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'login-admin' }))
    expect(await screen.findByText('HALAMAN-ADMIN')).toBeInTheDocument()
  })

  it('logout menghapus sesi dan kembali ke beranda', async () => {
    logout.mockResolvedValueOnce({})
    saveSession('tok', member)
    visit('/author')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(await screen.findByText('HALAMAN-LIST')).toBeInTheDocument()
    expect(logout).toHaveBeenCalled()
    expect(localStorage.getItem('delcom_blog_token')).toBeNull()
    expect(screen.getByRole('link', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('logout tetap menghapus sesi walau server gagal', async () => {
    logout.mockRejectedValueOnce(new Error('offline'))
    saveSession('tok', member)
    visit('/author')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(await screen.findByText('HALAMAN-LIST')).toBeInTheDocument()
    expect(localStorage.getItem('delcom_blog_token')).toBeNull()
  })

  it('sesi kedaluwarsa mengembalikan ke /login', async () => {
    saveSession('tok', member)
    visit('/author')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'sesi-habis' }))
    expect(await screen.findByText('HALAMAN-AUTH:login')).toBeInTheDocument()
    expect(localStorage.getItem('delcom_blog_token')).toBeNull()
  })

  it('tombol tema mengubah kelas dark pada html', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(document.documentElement).toHaveClass('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan mode terang' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
