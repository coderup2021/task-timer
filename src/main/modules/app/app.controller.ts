import { Controller } from '@nestjs/common'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { Payload } from '@nestjs/microservices'
import { of } from 'rxjs'
import type { BrowserWindow } from 'electron'
import { dialog } from 'electron'
import { OnEvent } from '@nestjs/event-emitter'
import type { IAudioPlayProps } from 'src/types/task.type'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Window() private readonly mainWin: BrowserWindow,
  ) {}

  @IpcHandle('msg')
  public async handleSendMsg(@Payload() msg: string) {
    const { webContents } = this.mainWin
    webContents.send('reply-msg', 'this is msg from webContents.send')
    return of(
      `The main process received your message: ${msg} at time: ${this.appService.getTime()}`,
    )
  }

  @IpcHandle('select-files')
  public async selectFiles() {
    return dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'file', extensions: [] }],
    })
  }

  @OnEvent('audio-play')
  public async onAudioPlay(data: IAudioPlayProps) {
    const { webContents } = this.mainWin
    webContents.send('audio-play', data)
  }

  @OnEvent('timer-task:nextSrc')
  public async onNextSrc(data: IAudioPlayProps) {
    const { webContents } = this.mainWin
    webContents.send('audio-play', data)
  }

  @OnEvent('audio-stop')
  public async onAudioStop() {
    const { webContents } = this.mainWin
    webContents.send('audio-stop')
    console.log('audio-stop')
  }
}
