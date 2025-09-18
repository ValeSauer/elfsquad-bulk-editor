<template>
  <n-space vertical>
    <n-input v-model:value="search" placeholder="Suche Name, Reference, Tag..." clearable style="max-width: 300px" />
    <n-select v-model:value="tagFilter" :options="tagOptions" placeholder="Nach Tag filtern" clearable style="max-width: 200px" />
    <n-button @click="openBulkDialog" :disabled="!selected.length">Bulk Edit</n-button>
  </n-space>
  <BulkEditDialog v-model:show="showBulk" :selected-ids="selected" @done="onBulkDone" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSelectionStore } from '../stores/selection'
import BulkEditDialog from './BulkEditDialog.vue'
import { useTagSetStore } from '../stores/tagSet'

const search = ref('')
const tagFilter = ref(null)
const showBulk = ref(false)
const selection = useSelectionStore()
const selected = computed(() => selection.selected)

const tagSetStore = useTagSetStore()
const tagOptions = computed(() => tagSetStore.getAll().map(t => ({ label: t, value: t })))

function openBulkDialog() {
  showBulk.value = true
}
function onBulkDone(updatedTagsById) {
  showBulk.value = false
  // Add all new tags to the global tag set
  if (updatedTagsById && typeof updatedTagsById === 'object') {
    Object.values(updatedTagsById).forEach(tags => tagSetStore.addTags(tags))
    selection.setBulkTags(updatedTagsById)
  }
  selection.clear()
}
</script>
