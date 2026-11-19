import Swal from 'sweetalert2'
import { confirmDelete, formatDate, showError, showSuccess } from './toolsHelper'

describe('toolsHelper', () => {
  it('showSuccess menampilkan dialog sukses', async () => {
    await showSuccess('Tersimpan')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'Tersimpan' }))
  })

  it('showError menampilkan dialog gagal', async () => {
    await showError('Oops')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Oops' }))
  })

  it('confirmDelete mengembalikan true saat dikonfirmasi', async () => {
    expect(await confirmDelete('Judul A')).toBe(true)
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('Judul A') }))
  })

  it('confirmDelete mengembalikan false saat dibatalkan', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await confirmDelete('Judul A')).toBe(false)
  })

  it('formatDate memformat tanggal atau mengembalikan strip', () => {
    expect(formatDate('2026-11-17T12:00:00Z')).toMatch(/2026/)
    expect(formatDate(null)).toBe('-')
  })
})