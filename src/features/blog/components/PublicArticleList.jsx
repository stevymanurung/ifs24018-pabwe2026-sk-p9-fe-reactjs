import { useEffect, useState } from 'react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import { formatDate } from '../../../helpers/toolsHelper'
import { fetchPublicPosts } from '../api/blogApi'
import { CATEGORIES } from '../constants'

const ALL = 'Semua'
const FILTERS = [ALL, ...CATEGORIES]

export default function PublicArticleList() {
  usePageMeta('Delcom Blog - Artikel Teknologi, Pendidikan, dan Lainnya', 'Baca artikel terbaru di Delcom Blog. Cari berdasarkan kata kunci atau filter kategori.')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      let result = []
      let message = ''
      try {
        result = await fetchPublicPosts({ q: query, category: category === ALL ? '' : category })
      } catch (err) {
        message = err.message
      }
      if (!active) return
      setPosts(result)
      setError(message)
      setLoading(false)
    }
    run()
    return () => {
      active = false
    }
  }, [query, category])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <section className="mb-8">
        <h1 className="m-0 text-3xl font-bold text-slate-900 dark:text-white">Delcom Blog</h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300">Temukan artikel terbaru dari para penulis kami.</p>
        <div className="mt-6">
          <label htmlFor="search-input" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Cari artikel
          </label>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci…"
            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div role="group" aria-label="Filter kategori" className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={
                category === name
                  ? 'rounded-full bg-indigo-700 px-4 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full border border-slate-400 bg-white px-4 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100'
              }
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Daftar artikel" className="min-h-[24rem]">
        {loading && <p role="status">Memuat artikel…</p>}
        {!loading && error && (
          <p role="alert" className="rounded-lg bg-red-100 p-4 text-red-900">
            {error}
          </p>
        )}
        {!loading && !error && posts.length === 0 && <p>Belum ada artikel yang cocok.</p>}
        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="mb-2 w-fit rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-900">
                  {post.category}
                </span>
                <h2 className="m-0 text-xl font-semibold">
                  <Link to={`/posts/${post.slug}`} className="text-slate-900 hover:underline dark:text-white">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-slate-700 dark:text-slate-300">{post.excerpt}</p>
                <p className="m-0 mt-4 text-sm text-slate-600 dark:text-slate-300">
                  {post.author_name} · {formatDate(post.published_at)} · {post.reading_time} menit baca
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
