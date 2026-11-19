import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import { vi } from 'vitest'
import { deletePost, fetchMyPosts, fetchStats, togglePublish } from '../api/blogApi'
import AuthorDashboard from './AuthorDashboard'

vi.mock('../api/blogApi', () => ({
  fetchMyPosts: vi.fn(),
  fetchStats: vi.fn(),
  togglePublish: vi.fn(),
  deletePost: vi.fn(),
}))
vi.mock('../modals/PostModal', async () => {
  const { createElement: h } = await import('react')
  return {
    default: (props) =>
      h(
        'div',
        { 'data-testid': 'post-modal' },
        h('span', null, `post:${props.post ? props.post.title : 'baru'}`),
        h('span', null, `draft:${props.draft ? props.draft.title : 'kosong'}`),
        h('button', { onClick: props.onClose }, 'tutup-post'),
        h('button', { onClick: props.onSaved }, 'simpan-post'),
      ),
  }
})
vi.mock('../modals/AiPostGeneratorModal', async () => {
  const { createElement: h } = await import('react')
  return {
    default: (props) =>
      h(
        'div',
        { 'data-testid': 'ai-modal' },
        h('button', { onClick: props.onClose }, 'tutup-ai'),
        h('button', { onClick: () => props.onApply({ title: 'Draf AI' }) }, 'terapkan-ai'),
      ),
  }
})

const posts = [
  { id: 1, title: 'Artikel Terbit', slug: 'artikel-terbit', category: 'Teknologi', is_published: true, created_at: '2026-11-01T12:00:00Z' },
  { id: 2, title: 'Artikel Draf', slug: 'artikel-draf', category: 'Umum', is_published: false, created_at: '2026-11-02T12:00:00Z' },
]
const stats = { total_articles: 2, total_selesai: 1, belum_selesai: 1 }

const setup = async () => {
  const onSessionExpired = vi.fn()
  render(<AuthorDashboard theme="light" onSessionExpired={onSessionExpired} />)
  await screen.findByText('Artikel Terbit')
  return { onSessionExpired }
}

beforeEach(() => {
  fetchMyPosts.mockResolvedValue(posts)
  fetchStats.mockResolvedValue(stats)
})

describe('AuthorDashboard', () => {
  it('menampilkan statistik dan tabel artikel', async () => {
    await setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Workspace Penulis' })).toBeInTheDocument()
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('2')
    expect(screen.getByRole('switch', { name: 'Terbit, ubah status Artikel Terbit' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Draf, ubah status Artikel Draf' })).toHaveAttribute('aria-checked', 'false')
    expect(document.title).toBe('Workspace Penulis | Delcom Blog')
  })

  it('menampilkan pesan saat belum ada artikel', async () => {
    fetchMyPosts.mockResolvedValue([])
    render(<AuthorDashboard theme="light" onSessionExpired={vi.fn()} />)
    expect(await screen.findByText('Anda belum menulis artikel.')).toBeInTheDocument()
  })

  it('menampilkan error pemuatan', async () => {
    fetchMyPosts.mockRejectedValue(Object.assign(new Error('Server error'), { status: 500 }))
    render(<AuthorDashboard theme="light" onSessionExpired={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
  })

  it('memanggil onSessionExpired saat token kedaluwarsa', async () => {
    fetchMyPosts.mockRejectedValue(Object.assign(new Error('expired'), { status: 401 }))
    const onSessionExpired = vi.fn()
    render(<AuthorDashboard theme="light" onSessionExpired={onSessionExpired} />)
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalled())
  })

  it('toggle status terbit memuat ulang data', async () => {
    togglePublish.mockResolvedValueOnce({})
    await setup()
    await userEvent.click(screen.getByRole('switch', { name: 'Draf, ubah status Artikel Draf' }))
    expect(togglePublish).toHaveBeenCalledWith(2)
    await waitFor(() => expect(fetchMyPosts).toHaveBeenCalledTimes(2))
  })

  it('toggle gagal menampilkan dialog error, 401 mengakhiri sesi', async () => {
    const { onSessionExpired } = await setup()
    togglePublish.mockRejectedValueOnce(Object.assign(new Error('Tidak bisa'), { status: 500 }))
    await userEvent.click(screen.getByRole('switch', { name: 'Draf, ubah status Artikel Draf' }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Tidak bisa' })))
    expect(onSessionExpired).not.toHaveBeenCalled()

    togglePublish.mockRejectedValueOnce(Object.assign(new Error('expired'), { status: 401 }))
    await userEvent.click(screen.getByRole('switch', { name: 'Draf, ubah status Artikel Draf' }))
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalled())
  })

  it('menu kebab: buka, tutup, dan isi menu sesuai status', async () => {
    await setup()
    const kebabPublished = screen.getByRole('button', { name: 'Menu aksi Artikel Terbit' })
    await userEvent.click(kebabPublished)
    expect(kebabPublished).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'Lihat' })).toHaveAttribute('href', '/posts/artikel-terbit')
    expect(within(menu).getByRole('menuitem', { name: 'Hapus' })).toBeInTheDocument()
    await userEvent.click(kebabPublished)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Draf' }))
    expect(within(screen.getByRole('menu')).queryByRole('menuitem', { name: 'Lihat' })).not.toBeInTheDocument()
  })

  it('Lihat menuju halaman artikel', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Terbit' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Lihat' }))
    expect(window.location.pathname).toBe('/posts/artikel-terbit')
  })

  it('Edit membuka modal, simpan memuat ulang data', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Terbit' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(await screen.findByText('post:Artikel Terbit')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'tutup-post' }))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tambah Artikel' }))
    expect(await screen.findByText('post:baru')).toBeInTheDocument()
    expect(screen.getByText('draft:kosong')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'simpan-post' }))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' })))
    await waitFor(() => expect(fetchMyPosts).toHaveBeenCalledTimes(2))
  })

  it('AI Generator: tutup dan terapkan draf ke editor', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    expect(await screen.findByTestId('ai-modal')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'tutup-ai' }))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'terapkan-ai' }))
    expect(await screen.findByText('draft:Draf AI')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
  })

  it('hapus artikel setelah konfirmasi', async () => {
    deletePost.mockResolvedValueOnce(null)
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Draf' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(2))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await waitFor(() => expect(fetchMyPosts).toHaveBeenCalledTimes(2))
  })

  it('tidak menghapus bila dibatalkan', async () => {
    await setup()
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Draf' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled())
    expect(deletePost).not.toHaveBeenCalled()
  })

  it('hapus gagal menampilkan error', async () => {
    deletePost.mockRejectedValueOnce(Object.assign(new Error('Gagal hapus'), { status: 500 }))
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Artikel Draf' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal hapus' })))
  })
})