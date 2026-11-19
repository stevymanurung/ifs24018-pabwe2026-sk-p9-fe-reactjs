import { vi } from 'vitest'
import { getRedirect, homeFor, matchRoute, navigate } from './router'

describe('navigate', () => {
  it('push state, memicu popstate dan scroll ke atas', () => {
    const onPop = vi.fn()
    window.addEventListener('popstate', onPop)
    navigate('/author')
    expect(window.location.pathname).toBe('/author')
    expect(onPop).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    window.removeEventListener('popstate', onPop)
  })

  it('replace state bila diminta', () => {
    const spy = vi.spyOn(window.history, 'replaceState')
    navigate('/login', { replace: true })
    expect(spy).toHaveBeenCalledWith({}, '', '/login')
    expect(window.location.pathname).toBe('/login')
    spy.mockRestore()
  })
})

describe('matchRoute', () => {
  it.each([
    ['/', { name: 'home' }],
    ['', { name: 'home' }],
    ['/public', { name: 'home' }],
    ['/posts/halo-dunia', { name: 'post', slug: 'halo-dunia' }],
    ['/posts/a%20b', { name: 'post', slug: 'a b' }],
    ['/login', { name: 'login' }],
    ['/register', { name: 'register' }],
    ['/author', { name: 'author' }],
    ['/admin/', { name: 'admin' }],
    ['/tidak-ada', { name: 'notfound' }],
    ['/posts', { name: 'notfound' }],
    ['/posts/a/b', { name: 'notfound' }],
  ])('%s', (path, expected) => {
    expect(matchRoute(path)).toEqual(expected)
  })
})

describe('homeFor & getRedirect', () => {
  const admin = { role: 'admin' }
  const member = { role: 'member' }

  it('homeFor', () => {
    expect(homeFor(admin)).toBe('/admin')
    expect(homeFor(member)).toBe('/author')
  })

  it('login/register', () => {
    expect(getRedirect('login', null)).toBeNull()
    expect(getRedirect('login', member)).toBe('/author')
    expect(getRedirect('register', admin)).toBe('/admin')
  })

  it('author', () => {
    expect(getRedirect('author', null)).toBe('/login')
    expect(getRedirect('author', member)).toBeNull()
  })

  it('admin', () => {
    expect(getRedirect('admin', null)).toBe('/login')
    expect(getRedirect('admin', member)).toBe('/author')
    expect(getRedirect('admin', admin)).toBeNull()
  })

  it('halaman lain tidak dialihkan', () => {
    expect(getRedirect('home', null)).toBeNull()
    expect(getRedirect('post', member)).toBeNull()
  })
})
