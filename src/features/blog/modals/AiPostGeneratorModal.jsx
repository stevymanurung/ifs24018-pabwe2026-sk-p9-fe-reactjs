import { useEffect, useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import useInput from '../../../hooks/useInput'
import { CATEGORIES } from '../constants'
import { generateDraft } from '../api/blogApi'

const inputClass =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-white'
const labelClass = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200'

export default function AiPostGeneratorModal({ onClose, onApply }) {
  const [topic, onTopic] = useInput()
  const [category, onCategory] = useInput('Umum')
  const [withSearch, setWithSearch] = useState(true)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleGenerate = async (event) => {
    event.preventDefault()
    if (!topic.trim()) {
      setError('Topik wajib diisi')
      return
    }
    setError('')
    setLoading(true)
    try {
      setDraft(await generateDraft({ topic: topic.trim(), category, include_web_search: withSearch }))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
        className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800"
      >
        <header className="bg-violet-800 px-6 py-4 text-white">
          <h2 id="ai-modal-title" className="m-0 text-xl font-semibold">
            AI Blog Generator
          </h2>
        </header>
        <form onSubmit={handleGenerate} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="ai-topic" className={labelClass}>
                Topik artikel
              </label>
              <input id="ai-topic" value={topic} onChange={onTopic} className={inputClass} />
            </div>
            <div>
              <label htmlFor="ai-category" className={labelClass}>
                Kategori
              </label>
              <select id="ai-category" value={category} onChange={onCategory} className={inputClass}>
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={withSearch} onChange={(e) => setWithSearch(e.target.checked)} />
              Sertakan penelusuran search engine
            </label>
          </div>
          {error && (
            <p role="alert" className="m-0 rounded-lg bg-red-100 p-3 text-sm text-red-900">
              {error}
            </p>
          )}
          {loading && <p role="status">Membuat draf artikel…</p>}
          {draft && (
            <section aria-label="Pratinjau draf" className="space-y-3">
              <h3 className="m-0 text-lg font-semibold text-slate-900 dark:text-white">{draft.title}</h3>
              <p className="m-0 text-sm text-slate-700 dark:text-slate-300">{draft.excerpt}</p>
              <MarkdownViewer content={draft.content} />
              {draft.sources && draft.sources.length > 0 && (
                <div>
                  <h4 className="mb-1 mt-0 font-semibold text-slate-900 dark:text-white">Sumber rujukan</h4>
                  <ul className="m-0 list-disc pl-5">
                    {draft.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-700 underline dark:text-indigo-300"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
        <footer className="flex justify-end gap-3 bg-violet-100 px-6 py-4 dark:bg-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-500 bg-white px-4 py-2 font-medium text-slate-900"
          >
            Batal
          </button>
          {draft && (
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white"
            >
              Terapkan ke Editor
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Generate Draf
          </button>
        </footer>
        </form>
      </div>
    </div>
  )
}
