import { useEffect, useState } from 'react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import useInput from '../../../hooks/useInput'
import { CATEGORIES } from '../constants'
import { createPost, updatePost } from '../api/blogApi'

const inputClass =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-white'
const labelClass = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200'

export default function PostModal({ post, draft, theme, onClose, onSaved }) {
  const initial = post || draft || {}
  const [title, onTitle] = useInput(initial.title || '')
  const [category, onCategory] = useInput(initial.category || 'Umum')
  const [excerpt, onExcerpt] = useInput(initial.excerpt || '')
  const [cover, onCover] = useInput(initial.cover_image_path || '')
  const [content, setContent] = useState(initial.content || '')
  const [published, setPublished] = useState(Boolean(initial.is_published))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten artikel wajib diisi')
      return
    }
    setError('')
    setSaving(true)
    const payload = {
      title: title.trim(),
      category,
      excerpt,
      content,
      cover_image_path: cover.trim(),
      is_published: published,
    }
    try {
      if (post) {
        await updatePost(post.id, payload)
      } else {
        await createPost(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800"
      >
        <header className="bg-indigo-700 px-6 py-4 text-white">
          <h2 id="post-modal-title" className="m-0 text-xl font-semibold">
            {post ? 'Edit Artikel' : 'Tambah Artikel'}
          </h2>
        </header>
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div>
              <label htmlFor="post-title" className={labelClass}>
                Judul
              </label>
              <input id="post-title" value={title} onChange={onTitle} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="post-category" className={labelClass}>
                  Kategori
                </label>
                <select id="post-category" value={category} onChange={onCategory} className={inputClass}>
                  {CATEGORIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="post-cover" className={labelClass}>
                  URL gambar sampul
                </label>
                <input id="post-cover" value={cover} onChange={onCover} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="post-excerpt" className={labelClass}>
                Ringkasan
              </label>
              <textarea id="post-excerpt" rows={2} value={excerpt} onChange={onExcerpt} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>Konten (Markdown)</p>
              <MarkdownEditor value={content} onChange={setContent} theme={theme} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Terbitkan artikel
            </label>
            {error && (
              <p role="alert" className="m-0 rounded-lg bg-red-100 p-3 text-sm text-red-900">
                {error}
              </p>
            )}
          </div>
          <footer className="flex justify-end gap-3 bg-slate-200 px-6 py-4 dark:bg-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-500 bg-white px-4 py-2 font-medium text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              Simpan
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
