import * as path from 'node:path'
import * as os from 'node:os'
import { NestFactory } from '@nestjs/core'
import { app } from 'electron'
import type { MicroserviceOptions } from '@nestjs/microservices'
import { ElectronIpcTransport } from '@doubleshot/nest-electron'
import type { NestExpressApplication } from '@nestjs/platform-express'
import * as fse from 'fs-extra'
import { AppModule } from './modules/app/app.module'
import { StaticModule } from './static-server.module'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {
  const isDev = !app.isPackaged
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.quit()
  })

  if (isDev) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit')
          app.quit()
      })
    }
    else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  }

  await app.whenReady()
}

const staticFileDir = path.resolve(os.homedir(), '.task-timer/static')

async function bootstrap() {
  try {
    await electronAppInit()
    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        strategy: new ElectronIpcTransport('IpcTransport'),
      },
    )
    await nestApp.listen()

    // 静态服务器;
    const staticServer
      = await NestFactory.create<NestExpressApplication>(StaticModule)
    fse.ensureDirSync(staticFileDir)
    staticServer.useStaticAssets(staticFileDir)
    await staticServer.listen(3678, '0.0.0.0')
  }
  catch (error) {
    console.log(error)
    app.quit()
  }
}

bootstrap()
