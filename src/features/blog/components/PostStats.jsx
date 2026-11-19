const ZERO = { total_articles: 0, total_selesai: 0, belum_selesai: 0 }

export default function PostStats({ stats }) {
  const s = stats || ZERO
  const items = [
    ['Total Artikel', s.total_articles],
    ['Terbit', s.total_selesai],
    ['Draf', s.belum_selesai],
  ]
  return (
    <section aria-label="Ringkasan statistik artikel" className="grid gap-4 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <p className="m-0 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
          <p className="m-0 mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      ))}
    </section>
  )
}
