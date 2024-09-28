import { Module } from '@nestjs/common'
import { TimerTaskController } from './timer-task.controller'
import { TimerTaskService } from './timer-task.service'

@Module({
  imports: [],
  controllers: [TimerTaskController],
  providers: [TimerTaskService],
})
export class TimerTaskModule {}
