import { Controller } from '@nestjs/common'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { Payload } from '@nestjs/microservices'
import { of } from 'rxjs'
import type { BrowserWindow } from 'electron'
import { dialog } from 'electron'
import { OnEvent } from '@nestjs/event-emitter'
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
  public async onAudioPlay({ src }) {
    const { webContents } = this.mainWin
    webContents.send('audio-play', { src })
    console.log('audio-play')
  }

  @OnEvent('audio-stop')
  public async onAudioStop() {
    const { webContents } = this.mainWin
    webContents.send('audio-stop')
    console.log('audio-stop')
  }
}
