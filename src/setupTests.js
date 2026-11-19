import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'

vi.mock('@tabler/icons-react', async () => {
  const { createElement } = await import('react')
  const make = (name) => (props) => createElement('svg', { 'data-icon': name, ...props })
  return {
    IconDotsVertical: make('dots'),
    IconMoon: make('moon'),
    IconPlus: make('plus'),
    IconSparkles: make('sparkles'),
    IconSun: make('sun'),
  }
})

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}))

beforeEach(() => {
  window.scrollTo = vi.fn()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  vi.clearAllMocks()
})
