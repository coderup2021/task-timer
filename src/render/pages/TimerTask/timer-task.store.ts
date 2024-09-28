import type { ITask } from 'src/types/task.type'
import { defineStore } from 'pinia'

const { getTaskList } = window.electron

export const useTimerTaskStore = defineStore('timer-task', {
  state: (): { data: ITask[], total: number } => ({ data: [], total: 0 }),
  getters: {
    //   doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
    fetchRemote() {
      getTaskList().then((res) => {
        this.data = res.list || []
        this.total = res.count || 0
      })
    },
  },
})
