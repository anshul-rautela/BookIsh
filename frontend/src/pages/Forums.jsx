import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getForums, createForum } from '../api/forums'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Forums() {
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data: forums, isLoading } = useQuery({
    queryKey: ['forums'],
    queryFn: getForums,
  })

  const createMutation = useMutation({
    mutationFn: createForum,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forums'] })
      setModal(false)
      setForm({ name: '', description: '' })
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">🗣️ Forums</h1>
          <p className="text-slate-400 mt-1">Community discussions on every genre and topic</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl font-medium transition-all"
          >
            + Create Forum
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <div className="space-y-3">
          {forums?.map(forum => (
            <Link
              key={forum.id}
              to={`/forums/${forum.name}`}
              className="flex items-center justify-between p-5 bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  📖
                </div>
                <div>
                  <h2 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors">
                    f/{forum.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">{forum.description}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 flex-shrink-0">
                <div className="font-medium text-slate-300">{forum.postCount || 0}</div>
                <div>posts</div>
              </div>
            </Link>
          ))}
          {!forums?.length && (
            <div className="text-center py-16 text-slate-500">
              <div className="text-5xl mb-3">🌐</div>
              <p>No forums yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Forum">
        <div className="space-y-4">
          <input
            placeholder="Forum name (e.g., fiction, mystery)"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 resize-none"
          />
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.name || createMutation.isPending}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Forum'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
