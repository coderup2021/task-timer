import { Controller } from '@nestjs/common'
import { IpcHandle, Window } from '@doubleshot/nest-electron'
import { BrowserWindow } from 'electron'
import { Payload } from '@nestjs/microservices'
import { Observable, of } from 'rxjs'
import { TimerTaskService } from './timer-task.service'
import { CreateTaskDto, ModifyTaskDto } from './timer-task.dto'

@Controller('task')
export class TimerTaskController {
  constructor(
    @Window() private readonly mainWin: BrowserWindow,
    private readonly timerTaskService: TimerTaskService,
  ) {}

  @IpcHandle('create')
  public async create(
    @Payload() taskDto: CreateTaskDto,
  ): Promise<Observable<Record<string, any>>> {
    const res = this.timerTaskService.create(taskDto)
    return of(res)
  }

  @IpcHandle('modify')
  public async modify(
    @Payload() taskDto: ModifyTaskDto,
  ): Promise<Observable<Record<string, any>>> {
    const res = this.timerTaskService.modify(taskDto)
    return of(res)
  }

  @IpcHandle('list')
  public list() {
    const res = this.timerTaskService.getList()
    return of(res)
  }

  @IpcHandle('detail')
  public detail(@Payload() dto: { id: number }) {
    const res = this.timerTaskService.get(dto.id)
    return of(res)
  }

  @IpcHandle('delete')
  public delete(@Payload() dto: { ids: number[] | number }) {
    const ids = Array.isArray(dto.ids) ? dto.ids : [dto.ids]
    console.log('🚀 ~ TimerTaskController ~ delete ~ ids:', ids)
    const res = this.timerTaskService.delete(ids)
    return of(res)
  }
}
