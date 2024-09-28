import type { TimerTask } from './timer-task.entity'

export class CreateTaskDto {
  name: string
  desc: string
  type: TimerTask['type']
  startAt: string
  endAt: string
  repeat: WeekDay[] // 格式 [1,2,3]
  files: string[]
}

export class ModifyTaskDto {
  id: number
  name: string
  desc: string
  type: TimerTask['type']
  startAt: string
  endAt: string
  repeat: WeekDay[] // 格式 [1,2,3]
  files: string[]
}
