import type { ITask } from 'src/types/task.type'

declare global {
  interface Window {
    electron: {
      sendMsg: (msg: string) => Promise<string>
      onReplyMsg: (cb: (msg: string) => any) => void

      selectFiles: () => Promise<Electron.OpenDialogReturnValue>
      getTaskList: () => Promise<ResList<ITask[]>>
      getTaskDetail: () => Promise<ResList<ITask>>
      createTask: (task: ICreateTask) => Promise<{ id: string }>
      modifyTask: (task: IModifyTask) => Promise<{ id: string }>
      deleteTask: (ids: number[]) => Promise<{ id: string }>
      onAudioPlay: (cb: (data: IAudioPlayProps) => any) => void
    }
  }
}

export {}
