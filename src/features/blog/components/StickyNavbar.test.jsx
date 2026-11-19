import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const setup = (props) => {
  const handlers = { onToggleTheme: vi.fn(), onLogout: vi.fn() }
  render(<StickyNavbar user={null} theme="light" {...handlers} {...props} />)
  return handlers
}

describe('StickyNavbar', () => {
  it('menampilkan tautan tamu dan tombol mode gelap', async () => {
    const { onToggleTheme } = setup()
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Daftar' })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('link', { name: 'Workspace' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(onToggleTheme).toHaveBeenCalled()
  })

  it('menampilkan tombol mode terang saat tema gelap', () => {
    setup({ theme: 'dark' })
    expect(screen.getByRole('button', { name: 'Aktifkan mode terang' })).toBeInTheDocument()
  })

  it('menampilkan menu member', async () => {
    const { onLogout } = setup({ user: { role: 'member' } })
    expect(screen.getByRole('link', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Masuk' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('menampilkan menu admin dan navigasi SPA', async () => {
    setup({ user: { role: 'admin' } })
    await userEvent.click(screen.getByRole('link', { name: 'Admin' }))
    expect(window.location.pathname).toBe('/admin')
  })
})
