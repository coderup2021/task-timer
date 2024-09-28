import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import 'element-plus/dist/index.css'

const pinia = createPinia()

createApp(App).use(pinia).use(router).use(ElementPlus).mount('#app')
