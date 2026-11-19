import { act, renderHook } from '@testing-library/react'
import useInput from './useInput'

describe('useInput', () => {
  it('nilai awal kosong secara default dan dapat diubah', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
    act(() => result.current[1]({ target: { value: 'abc' } }))
    expect(result.current[0]).toBe('abc')
  })

  it('reset dan setValue', () => {
    const { result } = renderHook(() => useInput('awal'))
    act(() => result.current[3]('baru'))
    expect(result.current[0]).toBe('baru')
    act(() => result.current[2]())
    expect(result.current[0]).toBe('awal')
  })
})
