<template>
  <FilterBar :selected="selection.selected" />
  <n-spin :show="loading">
    <n-tree
      :data="treeData"
      :default-expand-all="false"
      :expand-on-click="false"
      :show-line="true"
      :render-label="renderLabel"
      :on-load="onLoadWithLog"
      :selectable="true"
      :multiple="true"
      v-model:selected-keys="selectedKeys"
    />
  </n-spin>
</template>

<script setup>
import { ref, watch, h, watchEffect } from 'vue'
import { apiFetch, isAuthenticated } from '../api/elfsquad'
import FeatureRow from './FeatureRow.vue'
import { useSelectionStore } from '../stores/selection'
import FilterBar from './FilterBar.vue'
const loading = ref(false)
const treeData = ref([])
const selectedKeys = ref([])
const selection = useSelectionStore()
// Sync n-tree selection to selection store (featureIds only)
watchEffect(() => {
  // selectedKeys are like 'modelId:featureId', extract featureId
  const featureIds = selectedKeys.value.map(k => {
    if (typeof k === 'string' && k.includes(':')) return k.split(':')[1]
    return k
  })
  selection.selected = featureIds
})

// Lazy Loading Handler für tiefe Ebenen
async function onLoadWithLog(node) {
  await onLoad(node)
}

async function onLoad(node) {
  const featureModelId = node.featureModelId
  const featureId = node.featureId || (typeof node.key === 'string' ? node.key.split(':')[1] : undefined)
  try {
    // Nodes und Relationships für das Model laden
    let nodesRaw = await apiFetch(`/FeatureModelNodes?$filter=featureModelId eq ${featureModelId}`)
    let relsRaw = await apiFetch(`/FeatureModelRelationships?$filter=featureModelId eq ${featureModelId}`)
    const nodes = Array.isArray(nodesRaw.value) ? nodesRaw.value : nodesRaw
    const rels = Array.isArray(relsRaw.value) ? relsRaw.value : relsRaw
    // Finde die Node zu diesem Feature
    const thisNode = nodes.find(n => n.featureId === featureId)
    if (!thisNode) {
      node.children = []
      node.isLeaf = true
      return
    }
    // Finde alle Children über Relations
    const children = rels
      .filter(r => r.fromNodeId === thisNode.id)
      .sort((a, b) => a.order - b.order)
      .map(rel => {
        const childNode = nodes.find(n => n.id === rel.toNodeId)
        if (!childNode) {
          return null
        }
        return {
          key: `${featureModelId}:${childNode.featureId}`,
          label: childNode.featureId,
          isLeaf: !rels.some(r => r.fromNodeId === childNode.id),
          children: undefined,
          featureModelId,
          featureId: childNode.featureId,
        }
      })
      .filter(Boolean)
    node.children = children
    node.isLeaf = !children.length
  } catch (e) {
    window.$message?.error('Fehler beim Lazy Loading: ' + (e.message || e))
  }
}

// FeatureModel, Nodes, Relationships werden für den Tree geladen
async function loadTree() {
  if (!isAuthenticated.value) return
  loading.value = true
  try {
    // FeatureModels laden
    let modelsRaw = await apiFetch('/FeatureModels')
    let models = modelsRaw
    if (models && Array.isArray(models.value)) models = models.value
    else if (models && Array.isArray(models.items)) models = models.items
    else if (!Array.isArray(models)) {
      window.$message?.error('API-Response ist kein Array!')
      throw new Error('API-Response ist kein Array')
    }
    // Für jedes Model: Root-FeatureNode finden (FeatureId = rootFeatureId)
    treeData.value = await Promise.all(models.map(async (model) => {
      // Nodes für dieses Model laden
      const nodesRaw = await apiFetch(`/FeatureModelNodes?$filter=featureModelId eq ${model.id}`)
      const nodes = Array.isArray(nodesRaw.value) ? nodesRaw.value : nodesRaw
      const rootNode = nodes.find(n => n.featureId === model.rootFeatureId)
      if (!rootNode) {
        console.warn('Kein RootNode für Model', model)
        return null
      }
      return {
        key: `${model.id}:${rootNode.featureId}`,
        label: rootNode.featureId,
        isLeaf: false,
        children: undefined,
        featureModelId: model.id,
        featureId: rootNode.featureId,
      }
    }))
  treeData.value = treeData.value.filter(Boolean)
  } catch (e) {
    window.$message?.error('Fehler beim Laden der FeatureModels: ' + (e.message || e))
  } finally {
    loading.value = false
  }
}

function renderLabel({ option }) {
  // Zeige FeatureRow für jeden Knoten (option.label = featureId)
  return h(FeatureRow, { featureId: option.label })
}

function onExpand(expandedKeys, { node }) {
  // Lazy Loading für Kinder (später)
}

// Tree erst laden, wenn authentifiziert
watch(isAuthenticated, (val) => {
  if (val) loadTree()
})
</script>
