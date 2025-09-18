<template>
  <n-modal v-model:show="show" title="API Zugangsdaten" preset="dialog" :closable="false">
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Client ID">
        <n-input v-model:value="clientId" required />
      </n-form-item>
      <n-form-item label="Client Secret">
        <n-input v-model:value="clientSecret" type="password" required />
      </n-form-item>
      <n-form-item label="Tenant (optional)">
        <n-input v-model:value="tenant" />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" attr-type="submit" :loading="loading">Login</n-button>
      </n-form-item>
      <n-form-item v-if="error">
        <n-alert type="error">{{ error }}</n-alert>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref } from 'vue'
import { authenticate, isAuthenticated } from '../api/elfsquad'

const show = ref(true)
const clientId = ref('')
const clientSecret = ref('')
const tenant = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authenticate({ clientId: clientId.value, clientSecret: clientSecret.value, tenant: tenant.value })
    show.value = false
  } catch (e) {
    error.value = e.message || 'Fehler beim Login'
  } finally {
    loading.value = false
  }
}
</script>
