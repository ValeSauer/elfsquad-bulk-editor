import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../api/elfsquad'

export const useFeaturePropertiesStore = defineStore('featureProperties', () => {
  const properties = ref([]) // All available properties
  const values = ref({}) // { [featureId]: { [propertyId]: { value, textValue, ... } } }

  async function loadProperties() {
    const data = await apiFetch('/FeatureProperties')
    properties.value = data.value || []
  }

  async function loadValuesForFeature(featureId) {
    const data = await apiFetch(`/FeatureHasFeatureProperties?$filter=featureId eq ${featureId}`)
    const byProp = {}
    for (const row of (data.value || [])) {
      byProp[row.featurePropertyId] = row
    }
    values.value[featureId] = byProp
  }

  function setValue(featureId, propertyId, val) {
    if (!values.value[featureId]) values.value[featureId] = {}
    values.value[featureId][propertyId] = val
  }

  return { properties, values, loadProperties, loadValuesForFeature, setValue }
})
