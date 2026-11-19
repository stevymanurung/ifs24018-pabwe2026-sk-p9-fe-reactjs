import { render, screen } from '@testing-library/react'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan nol saat statistik belum ada', () => {
    render(<PostStats stats={null} />)
    expect(screen.getAllByText('0')).toHaveLength(3)
  })

  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total_articles: 9, total_selesai: 6, belum_selesai: 3 }} />)
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('9')
    expect(screen.getByText('Terbit').nextSibling).toHaveTextContent('6')
    expect(screen.getByText('Draf').nextSibling).toHaveTextContent('3')
  })
})
