<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <div class="app-root">
          <header class="app-header">
            <div class="app-title">Elfsquad Bulk Feature Tag Editor</div>
            <div class="app-status"><StatusBar /></div>
          </header>
          <main class="app-main">
            <AuthDialog />
            <!-- FilterBar removed -->
            <FeatureTree />
          </main>
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
import { darkTheme } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#646cff',
    primaryColorHover: '#535bf2',
    primaryColorPressed: '#747bff',
    cardColor: '#23232b',
    bodyColor: '#18181c',
    textColorBase: '#fff',
    borderRadius: '8px',
  },
  Button: {
    color: '#23232b',
    textColor: '#fff',
    colorHover: '#353545',
    colorPressed: '#18181c',
    border: '1px solid #535bf2',
  },
  Input: {
    color: '#23232b',
    textColor: '#fff',
    border: '1px solid #535bf2',
    placeholderColor: '#888',
  },
  Select: {
    color: '#23232b',
    textColor: '#fff',
    border: '1px solid #535bf2',
    placeholderColor: '#888',
  }
}
</script>

<style>
.app-root {
  min-height: 100vh;
  width: 100vw;
  background: #18181c;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.app-header {
  width: 100vw;
  background: #23232b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 56px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  font-size: 1rem;
  height: 48px;
}
.app-title {
  font-size: 1.05rem;
}
.app-title {
  font-weight: bold;
  letter-spacing: 0.03em;
}
.app-status {
  display: flex;
  align-items: center;
}
.app-main {
  flex: 1 1 auto;
  width: 100vw;
  max-width: 100vw;
  padding: 2rem;
  background: #18181c;
  color: #fff;
  overflow-x: auto;
}
</style>
