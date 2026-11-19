import { useCallback, useState } from 'react'

export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = useCallback((event) => setValue(event.target.value), [])
  const reset = useCallback(() => setValue(initial), [initial])
  return [value, onChange, reset, setValue]
}
