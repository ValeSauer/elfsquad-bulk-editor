<template>
  <n-modal :show="show" @update:show="onClose" title="Edit Feature Properties" preset="dialog">
    <n-form @submit.prevent="onSave">
      <n-form-item v-for="prop in allProperties" :key="prop.id" :label="prop.name">
        <n-input v-model:value="form[prop.id]" :placeholder="'Enter value for ' + prop.name" />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" attr-type="submit" :loading="loading">Save</n-button>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFeaturePropertiesStore } from '../stores/featureProperties'
import { apiFetch } from '../api/elfsquad'

const props = defineProps({
  show: Boolean,
  featureId: String
})
const emit = defineEmits(['update:show', 'saved'])

const featurePropertiesStore = useFeaturePropertiesStore()
const allProperties = computed(() => featurePropertiesStore.properties)
const propertyValues = computed(() => featurePropertiesStore.values[props.featureId] || {})
const form = ref({})
const loading = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    // Prefill form with current values
    form.value = {}
    for (const prop of allProperties.value) {
      form.value[prop.id] = propertyValues.value[prop.id]?.value ?? propertyValues.value[prop.id]?.textValue ?? ''
    }
  }
})

function onClose(val) {
  emit('update:show', val)
}

async function onSave() {
  loading.value = true
  try {
    // For each property, PATCH or POST the value for this feature
    for (const prop of allProperties.value) {
      const value = form.value[prop.id]
      // Only update if changed
      const propType = prop.type?.toLowerCase() || ''
      const isNumber = propType === 'input' || propType === 'number'
      const isText = propType === 'text'
      let body = { }
      if (isNumber && value !== '' && value !== null && value !== undefined) {
        body.value = Number(value)
      } else if (isText && value !== '' && value !== null && value !== undefined) {
        body.textValue = value
      }
      // Find existing assignment
      const existing = propertyValues.value[prop.id]
      if ((existing && ((isNumber && existing.value !== Number(value)) || (isText && existing.textValue !== value))) || (!existing && (body.value !== undefined || body.textValue !== undefined))) {
        if (existing) {
          // PATCH existing
          await apiFetch(`/FeatureHasFeatureProperties/${existing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
        } else if (body.value !== undefined || body.textValue !== undefined) {
          // POST new assignment
          await apiFetch(`/FeatureHasFeatureProperties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              featureId: props.featureId,
              featurePropertyId: prop.id,
              ...body
            })
          })
        }
      }
    }
    emit('saved')
    emit('update:show', false)
  } finally {
    loading.value = false
  }
}
</script>
