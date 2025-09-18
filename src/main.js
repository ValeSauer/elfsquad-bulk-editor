import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Pinia
import { createPinia } from 'pinia'

// Naive UI
import { createNaiveUi } from './plugins/naiveUi'

const app = createApp(App)
app.use(createPinia())
app.use(createNaiveUi())
app.mount('#app')
