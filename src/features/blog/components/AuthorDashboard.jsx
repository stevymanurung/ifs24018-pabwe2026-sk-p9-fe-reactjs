import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import { confirmDelete, formatDate, showError, showSuccess } from '../../../helpers/toolsHelper'
import { deletePost, fetchMyPosts, fetchStats, togglePublish } from '../api/blogApi'
import PostStats from './PostStats'

const PostModal = lazy(() => import('../modals/PostModal'))
const AiPostGeneratorModal = lazy(() => import('../modals/AiPostGeneratorModal'))

const menuItemClass =
  'block w-full px-4 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700'

export default function AuthorDashboard({ theme, onSessionExpired }) {
  usePageMeta('Workspace Penulis | Delcom Blog', 'Kelola artikel Anda: tulis, terbitkan, dan buat draf dengan AI generator.')
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([fetchMyPosts(), fetchStats()])
      setPosts(list)
      setStats(summary)
      setError('')
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired()
        return
      }
      setError(err.message)
    }
    setLoading(false)
  }, [onSessionExpired])

  useEffect(() => {
    load()
  }, [load])

  const fail = (err) => {
    if (err.status === 401) {
      onSessionExpired()
      return
    }
    showError(err.message)
  }

  const handleToggle = async (post) => {
    try {
      await togglePublish(post.id)
      await load()
    } catch (err) {
      fail(err)
    }
  }

  const handleDelete = async (post) => {
    setOpenMenu(null)
    if (!(await confirmDelete(post.title))) return
    try {
      await deletePost(post.id)
      showSuccess('Artikel berhasil dihapus')
      await load()
    } catch (err) {
      fail(err)
    }
  }

  const handleEdit = (post) => {
    setOpenMenu(null)
    setModal({ type: 'post', post })
  }

  const handleSaved = () => {
    setModal(null)
    showSuccess('Artikel berhasil disimpan')
    load()
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-3xl font-bold text-slate-900 dark:text-white">Workspace Penulis</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal({ type: 'ai' })}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-800 px-4 py-2 font-semibold text-white"
          >
            <IconSparkles size={18} aria-hidden="true" /> AI Generator
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: 'post' })}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white"
          >
            <IconPlus size={18} aria-hidden="true" /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <section aria-label="Daftar artikel saya" className="mt-8 min-h-screen">
        {loading && <p role="status">Memuat artikel…</p>}
        {!loading && error && (
          <p role="alert" className="rounded-lg bg-red-100 p-4 text-red-900">
            {error}
          </p>
        )}
        {!loading && !error && posts.length === 0 && <p>Anda belum menulis artikel.</p>}
        {!loading && !error && posts.length > 0 && (
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Daftar artikel milik Anda</caption>
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  <th scope="col" className="p-3">Judul</th>
                  <th scope="col" className="p-3">Kategori</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">Dibuat</th>
                  <th scope="col" className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-3 font-medium">{post.title}</td>
                    <td className="p-3">{post.category}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={post.is_published}
                        aria-label={`${post.is_published ? 'Terbit' : 'Draf'}, ubah status ${post.title}`}
                        onClick={() => handleToggle(post)}
                        className={
                          post.is_published
                            ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900'
                            : 'rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900'
                        }
                      >
                        {post.is_published ? 'Terbit' : 'Draf'}
                      </button>
                    </td>
                    <td className="p-3">{formatDate(post.created_at)}</td>
                    <td className="relative p-3">
                      <button
                        type="button"
                        aria-label={`Menu aksi ${post.title}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenu === post.id}
                        onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                        className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <IconDotsVertical size={20} aria-hidden="true" />
                      </button>
                      {openMenu === post.id && (
                        <div
                          role="menu"
                          className="absolute right-3 z-20 mt-1 w-40 rounded-lg border border-slate-300 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                        >
                          <button type="button" role="menuitem" className={menuItemClass} onClick={() => handleEdit(post)}>
                            Edit
                          </button>
                          {post.is_published && (
                            <Link to={`/posts/${post.slug}`} role="menuitem" className={menuItemClass}>
                              Lihat
                            </Link>
                          )}
                          <button type="button" role="menuitem" className={menuItemClass} onClick={() => handleDelete(post)}>
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        {modal && modal.type === 'post' && (
          <PostModal
            post={modal.post}
            draft={modal.draft}
            theme={theme}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
        {modal && modal.type === 'ai' && (
          <AiPostGeneratorModal
            onClose={() => setModal(null)}
            onApply={(draft) => setModal({ type: 'post', draft })}
          />
        )}
      </Suspense>
    </div>
  )
}