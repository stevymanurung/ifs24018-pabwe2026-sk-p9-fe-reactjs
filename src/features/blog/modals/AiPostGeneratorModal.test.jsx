import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { generateDraft } from '../api/blogApi'
import AiPostGeneratorModal from './AiPostGeneratorModal'

vi.mock('../api/blogApi', () => ({ generateDraft: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', async () => {
  const { createElement } = await import('react')
  return { default: ({ content }) => createElement('div', { 'data-testid': 'viewer' }, content) }
})

const draft = {
  title: 'Draf Judul',
  category: 'Teknologi',
  excerpt: 'Draf ringkasan',
  content: '# Draf isi',
  sources: [{ title: 'Sumber 1', url: 'https://s1.test', snippet: 's' }],
}

describe('AiPostGeneratorModal', () => {
  it('menolak topik kosong', async () => {
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'AI Blog Generator' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik wajib diisi')
    expect(generateDraft).not.toHaveBeenCalled()
  })

  it('membuat draf dengan sumber lalu menerapkannya ke editor', async () => {
    const onApply = vi.fn()
    generateDraft.mockResolvedValueOnce(draft)
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), ' Golang ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(generateDraft).toHaveBeenCalledWith({ topic: 'Golang', category: 'Teknologi', include_web_search: true })
    expect(await screen.findByText('Draf Judul')).toBeInTheDocument()
    expect(screen.getByText('Draf ringkasan')).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Draf isi')
    expect(screen.getByRole('heading', { name: 'Sumber rujukan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sumber 1' })).toHaveAttribute('href', 'https://s1.test')
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith(draft)
  })

  it('dapat menonaktifkan search engine dan menangani draf tanpa sumber', async () => {
    generateDraft.mockResolvedValueOnce({ ...draft, sources: undefined })
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'AI')
    await userEvent.click(screen.getByLabelText('Sertakan penelusuran search engine'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    await screen.findByText('Draf Judul')
    expect(generateDraft).toHaveBeenCalledWith({ topic: 'AI', category: 'Umum', include_web_search: false })
    expect(screen.queryByRole('heading', { name: 'Sumber rujukan' })).not.toBeInTheDocument()
  })

  it('draf dengan daftar sumber kosong tidak menampilkan bagian sumber', async () => {
    generateDraft.mockResolvedValueOnce({ ...draft, sources: [] })
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'AI')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    await screen.findByText('Draf Judul')
    expect(screen.queryByRole('heading', { name: 'Sumber rujukan' })).not.toBeInTheDocument()
  })

  it('menampilkan status memuat lalu error', async () => {
    let reject
    generateDraft.mockReturnValueOnce(new Promise((_, r) => (reject = r)))
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'AI')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(screen.getByRole('status')).toHaveTextContent('Membuat draf artikel')
    expect(screen.getByRole('button', { name: 'Generate Draf' })).toBeDisabled()
    await act(async () => reject(new Error('OpenAI gagal')))
    expect(await screen.findByRole('alert')).toHaveTextContent('OpenAI gagal')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('menutup lewat Batal dan Escape', async () => {
    const onClose = vi.fn()
    const { unmount } = render(<AiPostGeneratorModal onClose={onClose} onApply={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await userEvent.keyboard('x')
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
    unmount()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
