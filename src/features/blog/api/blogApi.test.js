import { vi } from 'vitest'
import { apiData, apiList } from '../../../helpers/apiHelper'
import {
  createPost,
  deletePost,
  fetchMyPosts,
  fetchPublicPost,
  fetchPublicPosts,
  fetchStats,
  generateDraft,
  togglePublish,
  updatePost,
} from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiData: vi.fn(), apiList: vi.fn() }))

describe('blogApi', () => {
  it('fetchPublicPosts membangun query string', () => {
    fetchPublicPosts()
    expect(apiList).toHaveBeenLastCalledWith('/api/public/posts')
    fetchPublicPosts({ q: 'go', category: 'Teknologi' })
    expect(apiList).toHaveBeenLastCalledWith('/api/public/posts?q=go&category=Teknologi')
    fetchPublicPosts({ category: 'Bisnis' })
    expect(apiList).toHaveBeenLastCalledWith('/api/public/posts?category=Bisnis')
    fetchPublicPosts({ q: 'x y' })
    expect(apiList).toHaveBeenLastCalledWith('/api/public/posts?q=x+y')
  })

  it('fetchPublicPost meng-encode slug', () => {
    fetchPublicPost('a b')
    expect(apiData).toHaveBeenCalledWith('/api/public/posts/a%20b')
  })

  it('endpoint penulis', () => {
    fetchMyPosts()
    expect(apiList).toHaveBeenLastCalledWith('/api/posts', { auth: true })
    fetchStats()
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/stats', { auth: true })
    createPost({ title: 't' })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts', { method: 'POST', body: { title: 't' }, auth: true })
    updatePost(3, { title: 'u' })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3', { method: 'PUT', body: { title: 'u' }, auth: true })
    togglePublish(3)
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH', auth: true })
    deletePost(3)
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3', { method: 'DELETE', auth: true })
  })

  it('generateDraft', () => {
    generateDraft({ topic: 'AI' })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/ai-generate', {
      method: 'POST',
      body: { topic: 'AI' },
      auth: true,
    })
  })
})
