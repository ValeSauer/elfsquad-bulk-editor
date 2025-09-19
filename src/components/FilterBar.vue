<template>
  <n-space vertical>
    <n-button @click="openBulkDialog" :disabled="!selected.length">Bulk Edit</n-button>
  </n-space>
  <BulkEditDialog v-model:show="showBulk" :selected-ids="selected" @done="onBulkDone" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSelectionStore } from '../stores/selection'
import BulkEditDialog from './BulkEditDialog.vue'

const showBulk = ref(false)
const selection = useSelectionStore()
const selected = computed(() => selection.selected)

function openBulkDialog() {
  showBulk.value = true
}
function onBulkDone(updatedTagsById) {
  showBulk.value = false
  selection.clear()
}
</script>
