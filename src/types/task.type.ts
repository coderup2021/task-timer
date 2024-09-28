import type { TimerTask } from '@main/modules/timer-task/timer-task.entity'

export type ITask = TimerTask
export type ICreateTask = Omit<RemoveId<RemoveDate<TimerTask>>, 'runCount'>
export type IModifyTask = Omit<Partial<RemoveDate<TimerTask>>, 'runCount'>
