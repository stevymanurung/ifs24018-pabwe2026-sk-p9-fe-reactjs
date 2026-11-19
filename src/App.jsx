import { useCallback, useEffect, useState } from 'react'
import Link from './components/Link'
import useTheme from './hooks/useTheme'
import usePageMeta from './hooks/usePageMeta'
import { getRedirect, homeFor, matchRoute, navigate } from './helpers/router'
import { clearSession, getToken, getUser, saveSession } from './helpers/sessionHelper'
import AdminDashboard from './features/admin/components/AdminDashboard'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import PublicArticleList from './features/blog/components/PublicArticleList'
import StickyNavbar from './features/blog/components/StickyNavbar'

function NotFound() {
  usePageMeta('Halaman tidak ditemukan | Delcom Blog', 'Halaman yang Anda cari tidak ditemukan di Delcom Blog.')
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="m-0 text-3xl font-bold text-slate-900 dark:text-white">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-slate-700 dark:text-slate-300">Alamat yang Anda tuju tidak tersedia.</p>
      <Link to="/" className="font-medium text-indigo-700 underline dark:text-indigo-300">
        Kembali ke beranda
      </Link>
    </div>
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(() => (getToken() ? getUser() : null))

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const route = matchRoute(path)
  const redirect = getRedirect(route.name, user)

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  const handleAuthSuccess = ({ token, user: account }) => {
    saveSession(token, account)
    setUser(account)
    navigate(homeFor(account))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // sesi lokal tetap dihapus walau server tidak dapat dihubungi
    }
    clearSession()
    setUser(null)
    navigate('/')
  }

  const handleSessionExpired = useCallback(() => {
    clearSession()
    setUser(null)
    navigate('/login', { replace: true })
  }, [])

  let page = null
  if (!redirect) {
    if (route.name === 'home') page = <PublicArticleList />
    else if (route.name === 'post') page = <PublicArticleDetail slug={route.slug} />
    else if (route.name === 'login' || route.name === 'register') page = <AuthPage mode={route.name} onSuccess={handleAuthSuccess} />
    else if (route.name === 'author') page = <AuthorDashboard theme={theme} onSessionExpired={handleSessionExpired} />
    else if (route.name === 'admin') page = <AdminDashboard onSessionExpired={handleSessionExpired} />
    else page = <NotFound />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
      >
        Lewati ke konten utama
      </a>
      <StickyNavbar user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
      <main id="main-content" className="flex-1">
        {page}
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
        © 2026 Delcom Blog
      </footer>
    </div>
  )
}
