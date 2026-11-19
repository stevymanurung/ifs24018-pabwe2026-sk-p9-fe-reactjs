import { IconMoon, IconSun } from '@tabler/icons-react'
import Link from '../../../components/Link'

const linkClass =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'

export default function StickyNavbar({ user, theme, onToggleTheme, onLogout }) {
  const isDark = theme === 'dark'
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <Link to="/" className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
          Delcom Blog
        </Link>
        <ul className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
          <li>
            <Link to="/" className={linkClass}>
              Beranda
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/author" className={linkClass}>
                  Workspace
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className={linkClass}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button type="button" onClick={onLogout} className={linkClass}>
                  Keluar
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={linkClass}>
                  Masuk
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800"
                >
                  Daftar
                </Link>
              </li>
            </>
          )}
          <li>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isDark ? <IconSun size={20} aria-hidden="true" /> : <IconMoon size={20} aria-hidden="true" />}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
