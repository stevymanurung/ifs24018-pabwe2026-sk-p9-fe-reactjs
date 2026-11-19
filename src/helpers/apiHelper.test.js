import { afterEach, vi } from 'vitest'
import { ApiError, apiData, apiList, apiRequest, API_BASE } from './apiHelper'
import { saveSession } from './sessionHelper'

const reply = (body, { ok = true, status = 200 } = {}) => ({ ok, status, json: async () => body })

describe('apiHelper', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('API_BASE kosong secara default', () => {
    expect(API_BASE).toBe('')
  })

  it('API_BASE dibaca dari env tanpa slash di akhir', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test///')
    vi.resetModules()
    const mod = await import('./apiHelper')
    expect(mod.API_BASE).toBe('https://api.example.test')
  })

  it('GET sederhana tanpa body dan tanpa token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply({ status: 'success', data: { a: 1 } }))
    vi.stubGlobal('fetch', fetchMock)
    const json = await apiRequest('/api/x')
    expect(json.data).toEqual({ a: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/api/x', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
    })
  })

  it('POST dengan body dan token', async () => {
    saveSession('tok', { id: 1 })
    const fetchMock = vi.fn().mockResolvedValue(reply({ status: 'success' }))
    vi.stubGlobal('fetch', fetchMock)
    await apiRequest('/api/x', { method: 'POST', body: { a: 1 }, auth: true })
    expect(fetchMock).toHaveBeenCalledWith('/api/x', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: '{"a":1}',
    })
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const err = await apiRequest('/api/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('Tidak dapat terhubung ke server')
    expect(err.status).toBe(0)
  })

  it('melempar ApiError dengan pesan server saat respons tidak ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'fail', message: 'Ditolak' }, { ok: false, status: 403 })))
    const err = await apiRequest('/api/x').catch((e) => e)
    expect(err.message).toBe('Ditolak')
    expect(err.status).toBe(403)
    expect(err.name).toBe('ApiError')
  })

  it('melempar ApiError saat status bukan success walau HTTP ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'error', message: 'Gagal' })))
    await expect(apiRequest('/api/x')).rejects.toThrow('Gagal')
  })

  it('memakai pesan bawaan bila respons bukan JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bukan json') } }),
    )
    await expect(apiRequest('/api/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('apiData mengembalikan data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'success', data: { b: 2 } })))
    expect(await apiData('/api/x')).toEqual({ b: 2 })
  })

  it('apiList mengembalikan data atau array kosong', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'success', data: [1] })))
    expect(await apiList('/api/x')).toEqual([1])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'success', data: null })))
    expect(await apiList('/api/x')).toEqual([])
  })
})
