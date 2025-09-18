<template>
  <div class="feature-row">
    <input type="checkbox" :checked="isSelected" @change="toggleSelection" style="margin-right: 0.5rem;" />
    <span class="feature-name">{{ feature.name }}</span>
    <span class="feature-article">{{ feature.articleCode }}</span>
    <span class="feature-ref">{{ feature.reference }}</span>
    <span class="feature-price">{{ feature.salesPrice }}</span>
    <n-select
      v-model:value="inputTags"
      :options="tagOptions"
      multiple
      tag
      filterable
      @update:value="onTagsChange"
      placeholder="Tags bearbeiten"
      style="min-width: 200px;"
    />
  </div>
</template>

<script setup>

import { ref, watch, computed } from 'vue'
import { apiFetch } from '../api/elfsquad'
import { useTagSetStore } from '../stores/tagSet'
import { useSelectionStore } from '../stores/selection'

const props = defineProps({
  featureId: String
})

const feature = ref({})
const inputTags = ref([])
const tagSetStore = useTagSetStore()
const selection = useSelectionStore()
const isSelected = computed(() => selection.selected.includes(props.featureId))
function toggleSelection() {
  selection.toggle(props.featureId)
}

// Watch for bulk tag updates for this feature
watch(
  () => selection.bulkTags[props.featureId],
  (newTags) => {
    if (Array.isArray(newTags)) {
      inputTags.value = [...newTags]
      feature.value.tags = [...newTags]
    }
  }
)
// Options: all globally known tags
const tagOptions = computed(() => {
  return tagSetStore.getAll().map(t => ({ label: t, value: t }))
})

async function loadFeature() {
  if (!props.featureId) return
  const data = await apiFetch(`/Features/${props.featureId}`)
  feature.value = data
  inputTags.value = [...(data.tags || [])]
  // Add tags to the global set
  tagSetStore.addTags(data.tags || [])
}

watch(() => props.featureId, loadFeature, { immediate: true })

function validateTags(tags) {
  // Max 5, only letters/numbers, no duplicates, no empty
  const valid = tags.filter((t, i, arr) => t && /^[a-zA-Z0-9]+$/.test(t) && arr.indexOf(t) === i)
  return valid.slice(0, 5)
}

async function onTagsChange(val) {
    console.log('Tags changed:', val)
  const tags = validateTags(val)
  inputTags.value = tags
  tagSetStore.addTags(tags)
  // Save immediately via PATCH
  try {
    console.log('Saving tags:', tags)
    await apiFetch(`/Features/${feature.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags })
    })
  // Instantly update UI (without reload)
    feature.value.tags = [...tags]
  } catch (e) {
    console.log('Error saving tags:', e)
  }
}

</script>

<style scoped>
.feature-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.25rem 0;
}
.feature-id, .feature-article, .feature-ref, .feature-name, .feature-price {
  min-width: 80px;
  font-size: 0.95em;
}
</style>
