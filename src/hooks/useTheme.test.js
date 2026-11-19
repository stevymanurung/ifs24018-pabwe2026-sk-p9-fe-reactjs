import { act, renderHook } from '@testing-library/react'
import useTheme from './useTheme'

describe('useTheme', () => {
  it('default terang', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('delcom_blog_theme')).toBe('light')
  })

  it('membaca tema gelap dari penyimpanan dan dapat di-toggle', () => {
    localStorage.setItem('delcom_blog_theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
  })
})
