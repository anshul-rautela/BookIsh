import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as forumApi from '../api/forums'

export function useForums() {
  return useQuery({
    queryKey: ['forums'],
    queryFn: forumApi.getForums,
  })
}

export function useForum(name) {
  return useQuery({
    queryKey: ['forum', name],
    queryFn: () => forumApi.getForumByName(name),
    enabled: !!name,
  })
}

export function useForumPosts(name, params) {
  return useQuery({
    queryKey: ['forum-posts', name, params],
    queryFn: () => forumApi.getForumPosts(name, params),
    enabled: !!name,
  })
}

export function useForumPost(id) {
  return useQuery({
    queryKey: ['forum-post', id],
    queryFn: () => forumApi.getPost(id),
    enabled: !!id,
  })
}

export function useVotePost(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vote) => forumApi.votePost(postId, vote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum-post', postId] }),
  })
}

export function useCreatePost(forumName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => forumApi.createPost(forumName, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', forumName] })
      qc.invalidateQueries({ queryKey: ['forum-posts', forumName] })
    },
  })
}

export function useAddForumComment(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => forumApi.addForumComment(postId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum-post', postId] }),
  })
}
