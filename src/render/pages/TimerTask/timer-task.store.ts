import type { ITask } from 'src/types/task.type'
import { defineStore } from 'pinia'

const { getTaskList } = window.electron

export const useTimerTaskStore = defineStore('timer-task', {
  state: (): { data: ITask[], total: number, runningId: number } => ({
    data: [],
    total: 0,
    runningId: -1,
  }),
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
        this.runningId = res.runningId || -1
      })
    },
  },
})
