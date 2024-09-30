import { Module } from '@nestjs/common'
import { TimerCoreService } from './timer-core.service'

@Module({
  imports: [],
  controllers: [],
  providers: [TimerCoreService],
  exports: [TimerCoreService],
})
export class TimerCoreModule {
  constructor(private readonly timerCoreService: TimerCoreService) {}
  onModuleInit() {
    console.log('timerCoreService onModuleInit')
    this.timerCoreService.run()
  }
}
