import { fireEvent, render, screen } from '@testing-library/react'
import Link from './Link'

describe('Link', () => {
  it('merender anchor dengan href', () => {
    render(<Link to="/author">Workspace</Link>)
    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute('href', '/author')
  })

  it('klik biasa melakukan navigasi SPA', () => {
    render(<Link to="/author">Workspace</Link>)
    const notPrevented = fireEvent.click(screen.getByRole('link'))
    expect(notPrevented).toBe(false)
    expect(window.location.pathname).toBe('/author')
  })

  it('klik dengan tombol modifier dibiarkan', () => {
    render(<Link to="/author">Workspace</Link>)
    const anchor = screen.getByRole('link')
    anchor.addEventListener('click', (e) => e.preventDefault())
    fireEvent.click(anchor, { ctrlKey: true })
    expect(window.location.pathname).toBe('/')
  })
})
