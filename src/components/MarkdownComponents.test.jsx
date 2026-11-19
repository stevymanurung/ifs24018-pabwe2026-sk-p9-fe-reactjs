import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const { editors, viewers } = vi.hoisted(() => ({ editors: [], viewers: [] }))

vi.mock('@toast-ui/editor', () => ({
  default: class {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      editors.push(this)
    }
    getMarkdown() {
      return 'markdown baru'
    }
  },
}))

vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: class {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      viewers.push(this)
    }
  },
}))

beforeEach(() => {
  editors.length = 0
  viewers.length = 0
})

describe('MarkdownEditor', () => {
  it('membuat editor dengan nilai awal dan tema bawaan', () => {
    render(<MarkdownEditor />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(editors).toHaveLength(1)
    expect(editors[0].options.initialValue).toBe('')
    expect(editors[0].options.theme).toBe('light')
  })

  it('meneruskan perubahan ke onChange terbaru tanpa membuat ulang editor', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<MarkdownEditor value="isi" onChange={first} />)
    expect(editors[0].options.initialValue).toBe('isi')
    editors[0].options.events.change()
    expect(first).toHaveBeenCalledWith('markdown baru')
    rerender(<MarkdownEditor value="isi 2" onChange={second} />)
    expect(editors).toHaveLength(1)
    editors[0].options.events.change()
    expect(second).toHaveBeenCalledWith('markdown baru')
  })

  it('membuat ulang editor saat tema berubah dan menghancurkannya saat unmount', () => {
    const { rerender, unmount } = render(<MarkdownEditor value="x" onChange={vi.fn()} theme="light" />)
    rerender(<MarkdownEditor value="x" onChange={vi.fn()} theme="dark" />)
    expect(editors).toHaveLength(2)
    expect(editors[0].destroy).toHaveBeenCalled()
    expect(editors[1].options.theme).toBe('dark')
    unmount()
    expect(editors[1].destroy).toHaveBeenCalled()
  })
})

describe('MarkdownViewer', () => {
  it('membuat viewer dan memperbaruinya saat konten berubah', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# A" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
    expect(viewers[0].options.initialValue).toBe('# A')
    rerender(<MarkdownViewer content="# B" />)
    expect(viewers[0].destroy).toHaveBeenCalled()
    expect(viewers[1].options.initialValue).toBe('# B')
    unmount()
    expect(viewers[1].destroy).toHaveBeenCalled()
  })
})
