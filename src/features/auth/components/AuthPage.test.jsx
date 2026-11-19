import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import { vi } from 'vitest'
import { login, register } from '../api/authApi'
import AuthPage from './AuthPage'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))

describe('AuthPage (login)', () => {
  it('memakai id input yang diwajibkan modul', () => {
    const { container } = render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    expect(container.querySelector('#login-username')).toBeInTheDocument()
    expect(container.querySelector('#login-password')).toBeInTheDocument()
    expect(container.querySelector('#login-submit')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toHaveAttribute('href', '/register')
    expect(document.title).toBe('Masuk | Delcom Blog')
  })

  it('menolak form kosong', async () => {
    render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Username dan password wajib diisi')
    expect(login).not.toHaveBeenCalled()
  })

  it('berhasil login', async () => {
    const onSuccess = vi.fn()
    login.mockResolvedValueOnce({ token: 't', user: { id: 1 } })
    render(<AuthPage mode="login" onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText('Username'), '  admin ')
    await userEvent.type(screen.getByLabelText('Password'), 'rahasia')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(login).toHaveBeenCalledWith({ username: 'admin', password: 'rahasia' })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
  })

  it('menampilkan pesan error dan mengaktifkan tombol kembali', async () => {
    login.mockRejectedValueOnce(new Error('Username atau password salah'))
    render(<AuthPage mode="login" onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Username'), 'a')
    await userEvent.type(screen.getByLabelText('Password'), 'b')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Username atau password salah')
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled()
  })
})

describe('AuthPage (register)', () => {
  it('menampilkan field email dan id register', () => {
    const { container } = render(<AuthPage mode="register" onSuccess={vi.fn()} />)
    expect(container.querySelector('#register-username')).toBeInTheDocument()
    expect(container.querySelector('#register-email')).toBeInTheDocument()
    expect(container.querySelector('#register-password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Masuk di sini' })).toHaveAttribute('href', '/login')
    expect(document.title).toBe('Daftar | Delcom Blog')
  })

  it('menolak bila email kosong', async () => {
    render(<AuthPage mode="register" onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Username'), 'budi')
    await userEvent.type(screen.getByLabelText('Password'), 'rahasia')
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Username, email, dan password wajib diisi')
    expect(register).not.toHaveBeenCalled()
  })

  it('berhasil mendaftar lalu menuju /login', async () => {
    register.mockResolvedValueOnce({})
    render(<AuthPage mode="register" onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Username'), 'budi')
    await userEvent.type(screen.getByLabelText('Email'), 'budi@mail.test')
    await userEvent.type(screen.getByLabelText('Password'), 'rahasia')
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(register).toHaveBeenCalledWith({ username: 'budi', email: 'budi@mail.test', password: 'rahasia' })
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' })))
  })

  it('menampilkan error dari server', async () => {
    register.mockRejectedValueOnce(new Error('username atau email sudah terdaftar'))
    render(<AuthPage mode="register" onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Username'), 'budi')
    await userEvent.type(screen.getByLabelText('Email'), 'budi@mail.test')
    await userEvent.type(screen.getByLabelText('Password'), 'rahasia')
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('sudah terdaftar')
  })
})