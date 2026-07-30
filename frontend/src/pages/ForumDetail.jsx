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
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
      {/* Forum Header */}
      <div className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-[#8C2520] text-[#FFFDF7] rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            📖
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#1C1917]">f/{forum.name}</h1>
            <p className="text-[#57534E] font-serif mt-1">{forum.description}</p>
          </div>
        </div>
        <div className="text-sm font-serif text-[#78716C]">{forum.postCount || 0} posts</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-[#F5EFE0] border border-[#E4D7C3] p-1 rounded-xl shadow-sm">
          {['new', 'top'].map(s => (
            <button
              key={s}
              onClick={() => { setSort(s); setPage(0) }}
              className={`px-4 py-1.5 text-sm rounded-lg font-serif font-bold transition-all capitalize ${
                sort === s ? 'bg-[#8C2520] text-[#FFFDF7] shadow-sm' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {s === 'new' ? '🆕 New' : '🔥 Top'}
            </button>
          ))}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] text-sm rounded-xl font-serif font-bold transition-all shadow-sm"
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
            <div key={post.id} className="flex gap-4 p-5 bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl hover:border-[#8C2520]/50 transition-all shadow-sm">
              {/* Vote Controls */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => isAuthenticated && voteMutation.mutate({ id: post.id, vote: 1 })}
                  className="text-[#78716C] hover:text-[#8C2520] text-lg transition-colors hover:scale-110"
                  disabled={!isAuthenticated}
                >
                  ▲
                </button>
                <span className={`text-sm font-serif font-bold ${post.voteCount > 0 ? 'text-[#8C2520]' : post.voteCount < 0 ? 'text-red-700' : 'text-[#78716C]'}`}>
                  {post.voteCount}
                </span>
                <button
                  onClick={() => isAuthenticated && voteMutation.mutate({ id: post.id, vote: -1 })}
                  className="text-[#78716C] hover:text-red-700 text-lg transition-colors hover:scale-110"
                  disabled={!isAuthenticated}
                >
                  ▼
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/forums/${name}/posts/${post.id}`}
                  className="font-serif font-bold text-lg text-[#1C1917] hover:text-[#8C2520] transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
                <p className="text-sm font-serif text-[#57534E] mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-4 mt-3 text-xs font-serif text-[#78716C]">
                  <span>by <span className="text-[#8C2520] font-bold">{post.user?.username}</span></span>
                  <span>💬 {post.commentCount}</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
          {!posts?.content?.length && (
            <div className="text-center py-16 text-[#78716C] font-serif">
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
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
          />
          <textarea
            placeholder="Post content..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={6}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] resize-none font-serif shadow-inner"
          />
          <button
            onClick={() => createPost.mutate(form, { onSuccess: () => { setModal(false); setForm({ title: '', body: '' }) } })}
            disabled={!form.title || !form.body || createPost.isPending}
            className="w-full py-3 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl font-serif font-bold transition-all shadow-sm"
          >
            {createPost.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
