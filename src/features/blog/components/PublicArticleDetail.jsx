import { lazy, Suspense, useEffect, useState } from 'react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import { formatDate } from '../../../helpers/toolsHelper'
import { fetchPublicPost } from '../api/blogApi'

const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer'))

const DEFAULT_DESC = 'Baca artikel lengkap di Delcom Blog.'

export default function PublicArticleDetail({ slug }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageMeta(post ? `${post.title} | Delcom Blog` : 'Artikel | Delcom Blog', post && post.excerpt ? post.excerpt : DEFAULT_DESC)

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      let result = null
      let message = ''
      try {
        result = await fetchPublicPost(slug)
      } catch (err) {
        message = err.message
      }
      if (!active) return
      setPost(result)
      setError(message)
      setLoading(false)
    }
    run()
    return () => {
      active = false
    }
  }, [slug])

  return (
    <article className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <Link to="/" className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300">
        ← Kembali ke beranda
      </Link>
      {loading && (
        <p role="status" className="mt-6 min-h-[24rem]">
          Memuat artikel…
        </p>
      )}
      {!loading && error && (
        <div role="alert" className="mt-6 rounded-lg bg-red-100 p-4 text-red-900">
          <h1 className="m-0 text-xl font-bold">Artikel tidak dapat dimuat</h1>
          <p className="mb-0 mt-2">{error}</p>
        </div>
      )}
      {!loading && post && (
        <>
          <header className="mt-6">
            <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-900">
              {post.category}
            </span>
            <h1 className="mb-2 mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{post.title}</h1>
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              {post.author_name} · {formatDate(post.published_at)} · {post.reading_time} menit baca
            </p>
          </header>
          {post.cover_image_path && (
            <img
              src={post.cover_image_path}
              alt={`Sampul artikel ${post.title}`}
              width="1200"
              height="400"
              className="my-6 h-56 w-full rounded-xl object-cover sm:h-96"
            />
          )}
          <div className="mt-6">
            <Suspense fallback={<p role="status">Memuat konten…</p>}>
              <MarkdownViewer content={post.content} />
            </Suspense>
          </div>
        </>
      )}
    </article>
  )
}
