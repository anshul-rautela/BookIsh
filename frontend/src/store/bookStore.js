import { create } from 'zustand'

export const useBookStore = create((set) => ({
  searchResults: [],
  searchQuery: '',
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearSearch: () => set({ searchResults: [], searchQuery: '' }),
}))
