import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagSetStore = defineStore('tagSet', () => {
  const tagSet = ref(new Set())
  // Add tags to the global set
  function addTags(tags) {
    tags.forEach(t => tagSet.value.add(t))
  }
  // Get all tags as array
  function getAll() {
    return Array.from(tagSet.value)
  }
  // Clear all tags
  function clear() {
    tagSet.value = new Set()
  }
  return { tagSet, addTags, getAll, clear }
})
