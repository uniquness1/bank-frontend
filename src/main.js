import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
app.use(Vue3Toastify, {
  autoClose: 3000,
})
app.use(createPinia())
app.use(router)

app.mount('#app')
