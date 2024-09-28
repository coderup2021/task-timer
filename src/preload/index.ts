import type { ICreateTask, IModifyTask, ITask } from 'src/types/task.type'
import electron, { contextBridge, dialog, ipcRenderer } from 'electron'

console.log('🚀 ~ 111111111dialog:', dialog, electron)

contextBridge.exposeInMainWorld('electron', {
  sendMsg: (msg: string): Promise<string> => ipcRenderer.invoke('msg', msg),
  onReplyMsg: (cb: (msg: string) => any) =>
    ipcRenderer.on('reply-msg', (e, msg: string) => {
      cb(msg)
    }),
  //   selectFiles: (): Promise<Electron.OpenDialogReturnValue> => {
  //     console.log("dialog", dialog);
  //     return dialog.showOpenDialog({
  //       properties: ["openFile", "multiSelections"],
  //       filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
  //     });
  //   },
  selectFiles: () =>
    ipcRenderer.invoke('select-files', {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
    }),

  getTaskList: (): Promise<ResList<ITask[]>> => {
    const eventName = 'task/list'
    return ipcRenderer.invoke(eventName)
  },

  getTaskDetail: (): Promise<ResList<ITask>> => {
    const eventName = 'task/detail'
    return ipcRenderer.invoke(eventName)
  },

  createTask: (task: ICreateTask): Promise<{ id: string }> => {
    const eventName = 'task/create'
    return ipcRenderer.invoke(eventName, task)
  },

  modifyTask: (task: IModifyTask): Promise<ResBody<{ id: string }>> => {
    const eventName = 'task/modify'
    return ipcRenderer.invoke(eventName, task)
  },

  deleteTask: (ids: number[]): Promise<ResBody<{ id: string }>> => {
    const eventName = 'task/delete'
    return ipcRenderer.invoke(eventName, { ids })
  },
})
