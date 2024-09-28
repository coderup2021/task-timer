import { createMemoryHistory, createRouter } from 'vue-router'

import Home from './pages/TimerTask/TimerTask.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/task', component: Home },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
