import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectionStore = defineStore('selection', () => {
  const selected = ref([]) // featureIds
  function toggle(id) {
    if (selected.value.includes(id)) {
      selected.value = selected.value.filter(f => f !== id)
    } else {
      selected.value.push(id)
    }
  }
  function clear() {
    selected.value = []
  }
  // Store a map of featureId -> tags for immediate UI update after bulk edit
  const bulkTags = ref({})
  function setBulkTags(map) {
    bulkTags.value = { ...bulkTags.value, ...map }
  }
  function clearBulkTags() {
    bulkTags.value = {}
  }
  return { selected, toggle, clear, bulkTags, setBulkTags, clearBulkTags }
})
