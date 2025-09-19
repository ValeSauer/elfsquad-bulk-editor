<template>
  <n-space align="center" justify="space-between" style="width: 100%;">
    <n-text>
      <span :style="{color: isAuthenticated ? 'green' : 'red'}">
        {{ isAuthenticated ? 'Connected' : 'Not connected' }}
      </span>
      <template v-if="isAuthenticated && tokenExpires">
        &nbsp;| Token expires in: {{ expiresIn }}
        <n-button size="small" @click="logout" style="margin-left: 1rem;">Logout</n-button>
      </template>
    </n-text>
  </n-space>
</template>

<script setup>

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isAuthenticated, tokenExpires, token } from '../api/elfsquad'

const now = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const expiresIn = computed(() => {
  if (!tokenExpires.value) return ''
  const ms = tokenExpires.value - now.value
  if (ms < 0) return 'expired'
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
