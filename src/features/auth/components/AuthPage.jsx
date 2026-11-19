import { useState } from 'react'
import Link from '../../../components/Link'
import useInput from '../../../hooks/useInput'
import usePageMeta from '../../../hooks/usePageMeta'
import { navigate } from '../../../helpers/router'
import { showSuccess } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'

const inputClass =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-white'
const labelClass = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200'

export default function AuthPage({ mode, onSuccess }) {
  const isLogin = mode === 'login'
  usePageMeta(
    isLogin ? 'Masuk | Delcom Blog' : 'Daftar | Delcom Blog',
    isLogin ? 'Masuk ke akun Delcom Blog Anda untuk mengelola artikel.' : 'Daftar akun penulis baru di Delcom Blog.',
  )
  const prefix = isLogin ? 'login' : 'register'
  const [username, onUsername] = useInput()
  const [email, onEmail] = useInput()
  const [password, onPassword] = useInput()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!username.trim() || !password || (!isLogin && !email.trim())) {
      setError(isLogin ? 'Username dan password wajib diisi' : 'Username, email, dan password wajib diisi')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        onSuccess(await login({ username: username.trim(), password }))
      } else {
        await register({ username: username.trim(), email: email.trim(), password })
        showSuccess('Registrasi berhasil, silakan masuk')
        navigate('/login')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="m-0 text-2xl font-bold text-slate-900 dark:text-white">
          {isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}
        </h1>
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor={`${prefix}-username`} className={labelClass}>
              Username
            </label>
            <input
              id={`${prefix}-username`}
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={onUsername}
              className={inputClass}
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="register-email" className={labelClass}>
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={onEmail}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label htmlFor={`${prefix}-password`} className={labelClass}>
              Password
            </label>
            <input
              id={`${prefix}-password`}
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={onPassword}
              className={inputClass}
            />
          </div>
          {error && (
            <p role="alert" className="m-0 rounded-lg bg-red-100 p-3 text-sm text-red-900">
              {error}
            </p>
          )}
          <button
            id={`${prefix}-submit`}
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
          >
            {isLogin ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <p className="mb-0 mt-6 text-sm text-slate-700 dark:text-slate-300">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link to={isLogin ? '/register' : '/login'} className="font-medium text-indigo-700 underline dark:text-indigo-300">
            {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
          </Link>
        </p>
      </div>
    </div>
  )
}
