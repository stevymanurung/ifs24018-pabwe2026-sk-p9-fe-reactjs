import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

export default function MarkdownViewer({ content }) {
  const elRef = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({ el: elRef.current, initialValue: content })
    return () => viewer.destroy()
  }, [content])

  return <div ref={elRef} className="rounded-xl bg-white p-4 text-slate-900 sm:p-8" data-testid="markdown-viewer" />
}
