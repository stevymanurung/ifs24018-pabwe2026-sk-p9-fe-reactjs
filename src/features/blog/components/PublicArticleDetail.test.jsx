import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { fetchPublicPost } from '../api/blogApi'
import PublicArticleDetail from './PublicArticleDetail'

vi.mock('../api/blogApi', () => ({ fetchPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', async () => {
  const { createElement } = await import('react')
  return { default: ({ content }) => createElement('div', { 'data-testid': 'viewer' }, content) }
})

const post = {
  title: 'Belajar Go',
  category: 'Teknologi',
  excerpt: 'Ringkasan Go',
  content: '# Isi',
  cover_image_path: 'https://img.test/cover.jpg',
  author_name: 'andi',
  published_at: '2026-11-10T12:00:00Z',
  reading_time: 4,
}

const metaDesc = () => document.querySelector('meta[name="description"]').getAttribute('content')

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dengan sampul dan markdown', async () => {
    fetchPublicPost.mockResolvedValueOnce(post)
    render(<PublicArticleDetail slug="belajar-go" />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat artikel')
    expect(await screen.findByRole('heading', { level: 1, name: 'Belajar Go' })).toBeInTheDocument()
    expect(fetchPublicPost).toHaveBeenCalledWith('belajar-go')
    expect(screen.getByAltText('Sampul artikel Belajar Go')).toHaveAttribute('src', post.cover_image_path)
    expect(await screen.findByTestId('viewer')).toHaveTextContent('# Isi')
    expect(screen.getByText(/4 menit baca/)).toBeInTheDocument()
    expect(document.title).toBe('Belajar Go | Delcom Blog')
    expect(metaDesc()).toBe('Ringkasan Go')
    expect(screen.getByRole('link', { name: /Kembali ke beranda/ })).toHaveAttribute('href', '/')
  })

  it('tanpa sampul dan tanpa ringkasan memakai deskripsi bawaan', async () => {
    fetchPublicPost.mockResolvedValueOnce({ ...post, cover_image_path: '', excerpt: '' })
    render(<PublicArticleDetail slug="x" />)
    await screen.findByRole('heading', { level: 1, name: 'Belajar Go' })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(metaDesc()).toBe('Baca artikel lengkap di Delcom Blog.')
  })

  it('menampilkan error saat artikel tidak ditemukan', async () => {
    fetchPublicPost.mockRejectedValueOnce(new Error('Artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="hilang" />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Artikel tidak ditemukan')
  })

  it('memuat ulang saat slug berubah', async () => {
    fetchPublicPost.mockResolvedValue(post)
    const { rerender } = render(<PublicArticleDetail slug="a" />)
    await screen.findByText('Belajar Go')
    rerender(<PublicArticleDetail slug="b" />)
    await screen.findByText('Belajar Go')
    expect(fetchPublicPost).toHaveBeenLastCalledWith('b')
  })

  it('mengabaikan hasil setelah unmount', async () => {
    let resolve
    fetchPublicPost.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const { unmount } = render(<PublicArticleDetail slug="a" />)
    unmount()
    await act(async () => resolve(post))
    expect(fetchPublicPost).toHaveBeenCalledTimes(1)
  })
})
