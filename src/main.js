
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createNaiveUi } from './plugins/naiveUi'
import { useFeaturePropertiesStore } from './stores/featureProperties'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(createNaiveUi())

// No JSON loading here. All feature property data will be loaded via API in components or stores.

app.mount('#app')
