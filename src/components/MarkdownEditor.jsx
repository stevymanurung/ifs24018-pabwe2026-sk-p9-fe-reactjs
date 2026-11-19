import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value = '', onChange, theme = 'light' }) {
  const elRef = useRef(null)
  const latest = useRef({ value, onChange })

  useEffect(() => {
    latest.current = { value, onChange }
  })

  useEffect(() => {
    const editor = new Editor({
      el: elRef.current,
      height: '420px',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      initialValue: latest.current.value,
      theme,
      usageStatistics: false,
      events: {
        change: () => latest.current.onChange(editor.getMarkdown()),
      },
    })
    return () => editor.destroy()
  }, [theme])

  return <div ref={elRef} data-testid="markdown-editor" />
}
