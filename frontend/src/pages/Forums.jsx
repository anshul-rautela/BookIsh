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
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-serif text-[#1C1917]">🗣️ Community Forums</h1>
          <p className="text-[#57534E] font-serif mt-1">Explore and create literary forums on every genre and theme</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] text-sm rounded-xl font-serif font-bold transition-all shadow-sm"
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
              className="flex items-center justify-between p-5 bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl hover:border-[#8C2520]/50 hover:shadow-lg hover:shadow-[#8C2520]/10 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8C2520] text-[#FFFDF7] rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                  📖
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#8C2520] transition-colors">
                    f/{forum.name}
                  </h2>
                  <p className="text-sm text-[#57534E] font-serif mt-0.5">{forum.description}</p>
                </div>
              </div>
              <div className="text-right text-xs text-[#78716C] font-serif flex-shrink-0">
                <div className="font-bold text-[#1C1917] text-sm">{forum.postCount || 0}</div>
                <div>posts</div>
              </div>
            </Link>
          ))}
          {!forums?.length && (
            <div className="text-center py-16 text-[#78716C] font-serif">
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
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] resize-none font-serif shadow-inner"
          />
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.name || createMutation.isPending}
            className="w-full py-3 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl font-serif font-bold transition-all shadow-sm"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Forum'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
