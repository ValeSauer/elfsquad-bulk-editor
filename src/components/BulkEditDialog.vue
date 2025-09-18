<template>
  <n-modal :show="localShow" @update:show="onUpdateShow" title="Bulk Tag Edit" preset="dialog">
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Aktion">
        <n-select v-model:value="action" :options="actionOptions" required />
      </n-form-item>
      <n-form-item label="Tags">
        <n-auto-complete v-model:value="tags" :options="tagOptions" multiple filterable placeholder="Tags" />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" attr-type="submit" :loading="loading">Anwenden</n-button>
      </n-form-item>
      <n-form-item v-if="errors.length">
        <n-alert type="error">
          <div v-for="err in errors" :key="err.id">{{ err.id }}: {{ err.msg }}</div>
        </n-alert>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiFetch } from '../api/elfsquad'


const props = defineProps({
  show: Boolean,
  selectedIds: Array
})
const emit = defineEmits(['update:show', 'done'])

const localShow = ref(props.show)
watch(() => props.show, val => { localShow.value = val })
function onUpdateShow(val) {
  emit('update:show', val)
}

const action = ref('add')
const tags = ref([])

// Ensure tags is always an array of strings (not a string)
watch(tags, (val, oldVal) => {
  if (typeof val === 'string') {
    tags.value = [val]
  }
})
const loading = ref(false)
const errors = ref([])
const tagOptions = ref([]) // TODO: global Tag-Vorschläge

const actionOptions = [
  { label: 'Hinzufügen', value: 'add' },
  { label: 'Entfernen', value: 'remove' },
  { label: 'Ersetzen', value: 'replace' }
]

watch(localShow, val => {
  if (val) {
    action.value = 'add'
    tags.value = []
    errors.value = []
  }
})

async function onSubmit() {
  loading.value = true
  errors.value = []
  const updatedTagsById = {}
  for (const id of props.selectedIds) {
    try {
      // Load feature
      const feature = await apiFetch(`/Features/${id}`)
      let tagArr = Array.isArray(tags.value) ? tags.value : [tags.value]
      tagArr = tagArr.filter(Boolean)
      let newTags = []
      if (action.value === 'add') {
        newTags = Array.from(new Set([...(feature.tags || []), ...tagArr])).slice(0, 5)
      } else if (action.value === 'remove') {
        newTags = (feature.tags || []).filter(t => !tagArr.includes(t))
      } else if (action.value === 'replace') {
        newTags = tagArr.slice(0, 5)
      }
      // Validation
      newTags = newTags.filter((t, i, arr) => /^[a-zA-Z0-9]+$/.test(t) && arr.indexOf(t) === i)
      await apiFetch(`/Features/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags: newTags }),
      })
      updatedTagsById[id] = newTags
    } catch (e) {
      errors.value.push({ id, msg: e.message })
    }
  }
  loading.value = false
  if (!errors.value.length) {
    emit('update:show', false)
    emit('done', updatedTagsById)
  }
}
</script>
