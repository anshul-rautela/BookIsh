import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForum, useForumPosts, useCreatePost } from '../hooks/useForum'
import { votePost } from '../api/forums'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatRelativeTime } from '../utils/dateUtils'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function ForumDetail() {
  const { name } = useParams()
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [sort, setSort] = useState('new')
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  const { data: forum, isLoading: forumLoading } = useForum(name)
  const { data: posts, isLoading: postsLoading } = useForumPosts(name, { sort, page, size: 20 })
  const createPost = useCreatePost(name)

  const voteMutation = useMutation({
    mutationFn: ({ id, vote }) => votePost(id, vote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum-posts', name] }),
  })

  if (forumLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!forum) return <div className="pt-24 text-center text-slate-400">Forum not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      {/* Forum Header */}
      <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/20 border border-[#2a2a4a] rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl">
            📖
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">f/{forum.name}</h1>
            <p className="text-slate-400 mt-1">{forum.description}</p>
          </div>
        </div>
        <div className="text-sm text-slate-500">{forum.postCount || 0} posts</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-[#1a1a2e] border border-[#2a2a4a] p-1 rounded-xl">
          {['new', 'top'].map(s => (
            <button
              key={s}
              onClick={() => { setSort(s); setPage(0) }}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all capitalize ${
                sort === s ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'new' ? '🆕 New' : '🔥 Top'}
            </button>
          ))}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl font-medium transition-all"
          >
            + New Post
          </button>
        )}
      </div>

      {/* Post List */}
      {postsLoading ? (
        <LoadingSpinner className="py-16" />
      ) : (
        <div className="space-y-3">
          {posts?.content?.map(post => (
            <div key={post.id} className="flex gap-4 p-4 bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl hover:border-violet-500/30 transition-all">
              {/* Vote Controls */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => isAuthenticated && voteMutation.mutate({ id: post.id, vote: 1 })}
                  className="text-slate-500 hover:text-violet-400 text-lg transition-colors hover:scale-110"
                  disabled={!isAuthenticated}
                >
                  ▲
                </button>
                <span className={`text-sm font-bold ${post.voteCount > 0 ? 'text-violet-400' : post.voteCount < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {post.voteCount}
                </span>
                <button
                  onClick={() => isAuthenticated && voteMutation.mutate({ id: post.id, vote: -1 })}
                  className="text-slate-500 hover:text-red-400 text-lg transition-colors hover:scale-110"
                  disabled={!isAuthenticated}
                >
                  ▼
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/forums/${name}/posts/${post.id}`}
                  className="font-semibold text-slate-100 hover:text-violet-400 transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.body}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                  <span>by <span className="text-violet-400">{post.user?.username}</span></span>
                  <span>💬 {post.commentCount}</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
          {!posts?.content?.length && (
            <div className="text-center py-16 text-slate-500">
              <div className="text-5xl mb-3">📝</div>
              <p>No posts yet. Be the first!</p>
            </div>
          )}
        </div>
      )}

      <Pagination page={page} totalPages={posts?.totalPages || 0} onPageChange={setPage} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={`New Post in f/${name}`}>
        <div className="space-y-4">
          <input
            placeholder="Post title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
          />
          <textarea
            placeholder="Post content..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={6}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 resize-none"
          />
          <button
            onClick={() => createPost.mutate(form, { onSuccess: () => { setModal(false); setForm({ title: '', body: '' }) } })}
            disabled={!form.title || !form.body || createPost.isPending}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            {createPost.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
