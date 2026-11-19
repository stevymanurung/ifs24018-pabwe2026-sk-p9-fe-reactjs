import { clearSession, getToken, getUser, saveSession } from './sessionHelper'

describe('sessionHelper', () => {
  it('mengembalikan null saat belum ada sesi', () => {
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('menyimpan dan membaca sesi', () => {
    saveSession('tok', { id: 1, username: 'andi' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ id: 1, username: 'andi' })
  })

  it('mengembalikan null bila data user rusak', () => {
    localStorage.setItem('delcom_blog_user', '{rusak')
    expect(getUser()).toBeNull()
  })

  it('menghapus sesi', () => {
    saveSession('tok', { id: 1 })
    clearSession()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})
