<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <!-- Hier folgt das Hauptlayout und Routing -->
        <div id="app">
          <h1>Elfsquad Feature Tag Editor</h1>
          <AuthDialog />
          <StatusBar />
          <FilterBar />
          <FeatureTree />
          <!-- Weitere Komponenten folgen -->
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import AuthDialog from './components/AuthDialog.vue'
import FeatureTree from './components/FeatureTree.vue'
import FilterBar from './components/FilterBar.vue'
import StatusBar from './components/StatusBar.vue'
</script>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}
</style>
