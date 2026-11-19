import { renderHook } from '@testing-library/react'
import usePageMeta from './usePageMeta'

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.querySelectorAll('meta[name="description"]').forEach((m) => m.remove())
  })

  it('membuat meta description bila belum ada', () => {
    renderHook(() => usePageMeta('Judul A', 'Deskripsi A'))
    expect(document.title).toBe('Judul A')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Deskripsi A')
  })

  it('memperbarui meta description yang sudah ada', () => {
    document.head.innerHTML = '<meta name="description" content="lama">'
    renderHook(() => usePageMeta('Judul B', 'Deskripsi B'))
    const metas = document.querySelectorAll('meta[name="description"]')
    expect(metas).toHaveLength(1)
    expect(metas[0]).toHaveAttribute('content', 'Deskripsi B')
  })
})
