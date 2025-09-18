<template>
  <n-space align="center" justify="space-between" style="width: 100%;">
    <n-text>Status: <span :style="{color: isAuthenticated ? 'green' : 'red'}">{{ isAuthenticated ? 'Verbunden' : 'Nicht verbunden' }}</span></n-text>
    <n-text v-if="tokenExpires">Token läuft ab: {{ expiresIn }}</n-text>
    <n-button size="small" @click="logout" v-if="isAuthenticated">Logout</n-button>
  </n-space>
</template>

<script setup>
import { computed } from 'vue'
import { isAuthenticated, tokenExpires, token } from '../api/elfsquad'

const expiresIn = computed(() => {
  if (!tokenExpires.value) return ''
  const ms = tokenExpires.value - Date.now()
  if (ms < 0) return 'abgelaufen'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}m ${sec}s`
})

function logout() {
  token.value = null
  tokenExpires.value = null
  isAuthenticated.value = false
}
</script>
