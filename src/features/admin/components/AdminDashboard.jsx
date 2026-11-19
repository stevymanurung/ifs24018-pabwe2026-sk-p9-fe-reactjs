import { useEffect, useState } from 'react'
import usePageMeta from '../../../hooks/usePageMeta'
import { formatDate } from '../../../helpers/toolsHelper'
import { fetchAllPosts, fetchUserPosts, fetchUsers } from '../api/adminApi'

export default function AdminDashboard({ onSessionExpired }) {
  usePageMeta('Admin Panel | Delcom Blog', 'Pantau seluruh pengguna dan artikel yang ada di Delcom Blog.')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      let result = []
      let message = ''
      try {
        const [userList, postList] = await Promise.all([
          fetchUsers(),
          selected ? fetchUserPosts(selected.id) : fetchAllPosts(),
        ])
        result = [userList, postList]
      } catch (err) {
        if (err.status === 401) {
          onSessionExpired()
        }
        message = err.message
      }
      if (!active) return
      if (message) {
        setError(message)
      } else {
        setUsers(result[0])
        setPosts(result[1])
        setError('')
      }
      setLoading(false)
    }
    run()
    return () => {
      active = false
    }
  }, [selected, onSessionExpired])

  const published = posts.filter((p) => p.is_published).length

  const cards = [
    ['Total Pengguna', users.length],
    ['Artikel Ditampilkan', posts.length],
    ['Artikel Terbit', published],
  ]

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <h1 className="mb-6 mt-0 text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
      <section aria-label="Ringkasan sistem" className="grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="m-0 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
            <p className="m-0 mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        ))}
      </section>

      <div className="min-h-screen">
      {loading && (
        <p role="status" className="mt-6">
          Memuat data…
        </p>
      )}
      {!loading && error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-100 p-4 text-red-900">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <section aria-label="Direktori pengguna" className="mt-8">
            <h2 className="text-xl font-semibold">Direktori Pengguna</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Daftar seluruh pengguna</caption>
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th scope="col" className="p-3">ID</th>
                    <th scope="col" className="p-3">Username</th>
                    <th scope="col" className="p-3">Email</th>
                    <th scope="col" className="p-3">Role</th>
                    <th scope="col" className="p-3">Artikel</th>
                    <th scope="col" className="p-3">Terbit</th>
                    <th scope="col" className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-3">{user.id}</td>
                      <td className="p-3 font-medium">{user.username}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.role}</td>
                      <td className="p-3">{user.total_articles}</td>
                      <td className="p-3">{user.total_published}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelected(user)}
                          className="font-medium text-indigo-700 underline dark:text-indigo-300"
                        >
                          Lihat artikel {user.username}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-label="Arsip artikel" className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {selected ? `Artikel dari ${selected.username}` : 'Seluruh Artikel'}
              </h2>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-500 px-3 py-1.5 text-sm font-medium"
                >
                  Tampilkan semua
                </button>
              )}
            </div>
            {posts.length === 0 && <p>Belum ada artikel.</p>}
            {posts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Arsip artikel</caption>
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-600">
                      <th scope="col" className="p-3">Judul</th>
                      <th scope="col" className="p-3">Penulis</th>
                      <th scope="col" className="p-3">Kategori</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-3 font-medium">{post.title}</td>
                        <td className="p-3">{post.author_name}</td>
                        <td className="p-3">{post.category}</td>
                        <td className="p-3">{post.is_published ? 'Terbit' : 'Draf'}</td>
                        <td className="p-3">{formatDate(post.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      </div>
    </div>
  )
}