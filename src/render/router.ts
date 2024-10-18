import { createMemoryHistory, createRouter } from 'vue-router'

import Home from './pages/TimerTask/TimerTask.vue'
import AiChat from './pages/AiChat/AiChat.vue'

const routes = [
  { path: '/', component: AiChat },
  { path: '/timer-task', component: Home },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
