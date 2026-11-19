// SweetAlert2 dimuat saat dibutuhkan agar tidak membebani bundle awal (halaman publik)
const loadSwal = async () => (await import('sweetalert2')).default

export const showSuccess = async (text) =>
  (await loadSwal()).fire({ icon: 'success', title: 'Berhasil', text, timer: 1800, showConfirmButton: false })

export const showError = async (text) => (await loadSwal()).fire({ icon: 'error', title: 'Gagal', text })

export const confirmDelete = async (title) => {
  const Swal = await loadSwal()
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus artikel?',
    text: `Artikel "${title}" akan dihapus permanen.`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'