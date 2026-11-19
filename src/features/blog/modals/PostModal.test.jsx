import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { createPost, updatePost } from '../api/blogApi'
import PostModal from './PostModal'

vi.mock('../api/blogApi', () => ({ createPost: vi.fn(), updatePost: vi.fn() }))
vi.mock('../../../components/MarkdownEditor', async () => {
  const { createElement } = await import('react')
  return {
    default: ({ value, onChange }) =>
      createElement('textarea', { 'aria-label': 'Konten', value, onChange: (e) => onChange(e.target.value) }),
  }
})

const handlers = () => ({ onClose: vi.fn(), onSaved: vi.fn() })

describe('PostModal', () => {
  it('menolak simpan bila judul/konten kosong', async () => {
    const h = handlers()
    render(<PostModal theme="light" {...h} />)
    expect(screen.getByRole('dialog', { name: 'Tambah Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul dan konten artikel wajib diisi')
    expect(createPost).not.toHaveBeenCalled()
  })

  it('membuat artikel baru', async () => {
    const h = handlers()
    createPost.mockResolvedValueOnce({})
    render(<PostModal theme="light" {...h} />)
    await userEvent.type(screen.getByLabelText('Judul'), ' Judul Baru ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText('Ringkasan'), 'Ringkas')
    await userEvent.type(screen.getByLabelText('URL gambar sampul'), 'https://img.test/a.png')
    await userEvent.type(screen.getByLabelText('Konten'), 'isi')
    await userEvent.click(screen.getByLabelText('Terbitkan artikel'))
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(h.onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru',
      category: 'Bisnis',
      excerpt: 'Ringkas',
      content: 'isi',
      cover_image_path: 'https://img.test/a.png',
      is_published: true,
    })
  })

  it('mengedit artikel yang ada', async () => {
    const h = handlers()
    updatePost.mockResolvedValueOnce({})
    const post = {
      id: 5,
      title: 'Lama',
      category: 'Opini',
      excerpt: 'e',
      content: 'c',
      cover_image_path: '',
      is_published: true,
    }
    render(<PostModal post={post} theme="dark" {...h} />)
    expect(screen.getByRole('dialog', { name: 'Edit Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Opini')
    expect(screen.getByLabelText('Terbitkan artikel')).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(h.onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(5, expect.objectContaining({ title: 'Lama', is_published: true }))
    expect(createPost).not.toHaveBeenCalled()
  })

  it('memakai draf AI sebagai nilai awal artikel baru', async () => {
    const h = handlers()
    createPost.mockResolvedValueOnce({})
    render(<PostModal draft={{ title: 'Draf AI', category: 'Teknologi', excerpt: 'x', content: 'isi AI' }} theme="light" {...h} />)
    expect(screen.getByLabelText('Judul')).toHaveValue('Draf AI')
    expect(screen.getByLabelText('Terbitkan artikel')).not.toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(createPost).toHaveBeenCalled())
  })

  it('menampilkan error API dan dapat mencoba lagi', async () => {
    const h = handlers()
    createPost.mockRejectedValueOnce(new Error('Gagal membuat artikel'))
    render(<PostModal draft={{ title: 'T', content: 'C' }} theme="light" {...h} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal membuat artikel')
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeEnabled()
    expect(h.onSaved).not.toHaveBeenCalled()
  })

  it('menutup lewat tombol Batal dan tombol Escape', async () => {
    const h = handlers()
    const { unmount } = render(<PostModal theme="light" {...h} />)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(h.onClose).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('a')
    expect(h.onClose).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{Escape}')
    expect(h.onClose).toHaveBeenCalledTimes(2)
    unmount()
    await userEvent.keyboard('{Escape}')
    expect(h.onClose).toHaveBeenCalledTimes(2)
  })
})
