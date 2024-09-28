import { join } from 'node:path'
import { Module } from '@nestjs/common'
import { ElectronModule } from '@doubleshot/nest-electron'
import { BrowserWindow, app } from 'electron'
import { TimerTaskModule } from '../timer-task/timer-task.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

app.disableHardwareAcceleration()

@Module({
  imports: [
    ElectronModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const isDev = !app.isPackaged
        const win = new BrowserWindow({
          width: 1024,
          height: 768,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
          },
        })

        win.on('closed', () => {
          win.destroy()
        })

        const URL = isDev
          ? process.env.DS_RENDERER_URL
          : `file://${join(app.getAppPath(), 'dist/render/index.html')}`

        win.loadURL(URL)
        win.webContents.openDevTools()

        return { win }
      },
    }),
    TimerTaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
