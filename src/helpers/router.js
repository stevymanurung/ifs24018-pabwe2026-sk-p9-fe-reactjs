const PAGES = ['login', 'register', 'author', 'admin']

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function matchRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/public') return { name: 'home' }
  const post = path.match(/^\/posts\/([^/]+)$/)
  if (post) return { name: 'post', slug: decodeURIComponent(post[1]) }
  const page = path.slice(1)
  if (PAGES.includes(page)) return { name: page }
  return { name: 'notfound' }
}

export const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/author')

export function getRedirect(name, user) {
  if (name === 'login' || name === 'register') return user ? homeFor(user) : null
  if (name === 'author') return user ? null : '/login'
  if (name === 'admin') {
    if (!user) return '/login'
    return user.role === 'admin' ? null : '/author'
  }
  return null
}
