<template>
  <div class="feature-row">
    <n-checkbox :checked="isSelected" @update:checked="toggleSelection" style="margin-right: 0.5rem; vertical-align: middle;" />
    <span class="feature-name">{{ feature.name }}</span>
    <span class="feature-article">{{ feature.articleCode }}</span>
    <span class="feature-ref">{{ feature.reference }}</span>
    <span>
      <n-input
        v-model:value="editPriceDisplay"
        size="small"
        style="width: 100px;"
        :placeholder="'Price'"
        @blur="onPriceBlur"
        @input="onPriceInput"
      />
    </span>
    <n-select
      v-model:value="inputTags"
      :options="tagOptions"
      multiple
      tag
      filterable
      @update:value="onTagsChange"
      placeholder="Edit tags"
      style="width: 220px; min-width: 220px; max-width: 220px;"
    />
    <span class="feature-properties" @click="showPropertyDialog = true" style="cursor:pointer;">
      <template v-if="Object.keys(propertyValues).length">
        <template v-for="prop in allProperties" :key="prop.id">
          <span v-if="propertyValues[prop.id] && (propertyValues[prop.id].value !== undefined && propertyValues[prop.id].value !== null && propertyValues[prop.id].value !== '')" class="feature-property-card">
            <span class="feature-property-name">{{ prop.name }}</span>
            <span class="feature-property-value">{{ propertyValues[prop.id].value ?? propertyValues[prop.id].textValue ?? '' }}</span>
          </span>
        </template>
      </template>
      <template v-else>
        <span class="no-feature-property">No feature properties</span>
      </template>
    </span>
    <FeaturePropertyDialog v-model:show="showPropertyDialog" :feature-id="props.featureId" @saved="onPropertySaved" />
  </div>
</template>

<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { NCheckbox, NInput } from 'naive-ui'
import { apiFetch } from '../api/elfsquad'
import { useTagSetStore } from '../stores/tagSet'
import { useSelectionStore } from '../stores/selection'
import { useFeaturePropertiesStore } from '../stores/featureProperties'
import FeaturePropertyDialog from './FeaturePropertyDialog.vue'

const props = defineProps({
  featureId: String
})

const feature = ref({})
const editPrice = ref()
const editPriceDisplay = ref('')

function parseCurrency(str) {
  if (!str) return 0
  // Remove all non-numeric except comma, dot, and minus
  const cleaned = str.replace(/[^\d,.-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function formatCurrency(val) {
  if (typeof val !== 'number' || isNaN(val)) return ''
  return val === 0 ? '' : val.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
}

function onPriceInput(val) {
  // Allow user to type freely, but keep in sync with editPrice
  editPriceDisplay.value = val
}

async function onPriceBlur() {
  const value = parseCurrency(editPriceDisplay.value)
  editPrice.value = value
  // Format for display
  editPriceDisplay.value = formatCurrency(value)
  if (value !== feature.value.salesPrice) {
    try {
      await apiFetch(`/Features/${feature.value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesPrice: value })
      })
      feature.value.salesPrice = value
    } catch (e) {
      window.$message?.error('Failed to save price')
    }
  }
}
const inputTags = ref([])
const tagSetStore = useTagSetStore()
const selection = useSelectionStore()
const featurePropertiesStore = useFeaturePropertiesStore()
const showPropertyDialog = ref(false)

const isSelected = computed(() => selection.selected.includes(props.featureId))
const allProperties = computed(() => featurePropertiesStore.properties)
const propertyValues = computed(() => featurePropertiesStore.values[props.featureId] || {})

function toggleSelection() {
  selection.toggle(props.featureId)
}

// Watch for bulk tag updates for this feature, always update tags if present
watch(
  () => selection.bulkTags[props.featureId],
  (newTags) => {
    if (Array.isArray(newTags)) {
      inputTags.value = [...newTags]
      feature.value.tags = [...newTags]
    } else if (newTags === undefined) {
      // If bulkTags is cleared, but tags were just set, keep them in the UI
      // Do nothing, keep current tags
    }
  },
  { immediate: true }
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
  // Set price input: empty if 0, else value
  editPrice.value = (!data.salesPrice || data.salesPrice === 0) ? 0 : data.salesPrice
  editPriceDisplay.value = (!data.salesPrice || data.salesPrice === 0) ? '' : formatCurrency(data.salesPrice)
}

onMounted(() => {
  featurePropertiesStore.loadProperties()
  featurePropertiesStore.loadValuesForFeature(props.featureId)
  loadFeature()
})

watch(() => props.featureId, (id) => {
  if (id) {
    featurePropertiesStore.loadValuesForFeature(id)
    loadFeature()
  }
}, { immediate: true })

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

function onPropertySaved() {
  showPropertyDialog.value = false
  featurePropertiesStore.loadValuesForFeature(props.featureId)
}

</script>

<style scoped>
.feature-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.25rem 0;
  /* Ensure vertical alignment with tree arrow */
  min-height: 32px;
}
.feature-id, .feature-article, .feature-ref, .feature-name, .feature-price {
  min-width: 80px;
  font-size: 0.95em;
}
.feature-properties {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  min-width: 200px;
  max-width: 400px;
  flex-wrap: wrap;
  word-break: break-word;
}
.feature-property-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #23232b;
  border: 1px solid #282832;
  border-radius: 3px;
  padding: 0.08rem 0.38rem 0.14rem 0.38rem;
  min-width: 60px;
  margin-bottom: 2px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: border 0.2s;
}
.feature-property-card:hover {
  border: 1.2px solid #353545;
}
.feature-property-name {
  font-size: 0.68em;
  color: #aaa;
  margin-bottom: 0.02em;
  font-weight: 400;
  letter-spacing: 0.01em;
}
.feature-property-value {
  font-size: 0.98em;
  color: #e0e0e0;
  font-weight: 400;
  word-break: break-all;
}
.feature-property-label {
  font-weight: 500;
  margin-left: 0.5rem;
}
.feature-property-value {
  min-width: 40px;
}
.no-feature-property {
  color: #999;
  font-style: italic;
}
</style>
