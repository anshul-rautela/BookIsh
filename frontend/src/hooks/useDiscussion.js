import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as discussionApi from '../api/discussions'

export function useDiscussions(bookId, params) {
  return useQuery({
    queryKey: ['discussions', bookId, params],
    queryFn: () => discussionApi.getDiscussions(bookId, params),
    enabled: !!bookId,
  })
}

export function useDiscussion(id) {
  return useQuery({
    queryKey: ['discussion', id],
    queryFn: () => discussionApi.getDiscussion(id),
    enabled: !!id,
  })
}

export function useCreateDiscussion(bookId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => discussionApi.createDiscussion(bookId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discussions', bookId] }),
  })
}

export function useAddComment(discussionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => discussionApi.addComment(discussionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discussion', discussionId] }),
  })
}
