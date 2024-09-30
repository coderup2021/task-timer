import { Module } from '@nestjs/common'
import { TimerCoreModule } from '../timer-core/timer-core.module'
import { TimerCoreService } from '../timer-core/timer-core.service'
import { TimerTaskController } from './timer-task.controller'
import { TimerTaskService } from './timer-task.service'

@Module({
  imports: [TimerCoreModule],
  controllers: [TimerTaskController],
  providers: [TimerTaskService, TimerCoreService],
})
export class TimerTaskModule {}
