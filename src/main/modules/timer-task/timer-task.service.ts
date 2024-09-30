import os from 'node:os'
import path from 'node:path'
import { Injectable } from '@nestjs/common'
import fse from 'fs-extra'
import { TimerTask } from './timer-task.entity'
import { CreateTaskDto, ModifyTaskDto } from './timer-task.dto'

@Injectable()
export class TimerTaskService {
  dbFileDir = path.resolve(os.homedir(), './.task-timer')
  dbFileName = 'task-timer.json'
  dbFilePath = path.resolve(this.dbFileDir, this.dbFileName)
  maxId = 0
  tasks: TimerTask[] = []
  constructor() {
    this.ensureJsonDBFile()
    this.tasks = fse.readJsonSync(this.dbFilePath)
    this.maxId = this.getMaxId()
  }

  ensureJsonDBFile() {
    if (!fse.existsSync(this.dbFileDir))
      fse.mkdirSync(this.dbFileDir)
    if (!fse.existsSync(this.dbFilePath))
      fse.writeJsonSync(this.dbFilePath, [])
  }

  syncDataToDB() {
    fse.writeJsonSync(this.dbFilePath, this.tasks)
  }

  getMaxId() {
    let max = 0
    for (const task of this.tasks) {
      if (task.id > max) {
        max = task.id
      }
    }
    return max
  }

  genId() {
    this.maxId++
    return this.maxId
  }

  async create(dto: CreateTaskDto) {
    const task = new TimerTask()
    task.name = dto.name
    task.desc = dto.desc
    task.type = dto.type
    task.startAt = dto.startAt
    task.endAt = dto.endAt
    task.repeat = dto.repeat
    task.files = dto.files
    task.id = this.genId()

    this.tasks.push(task)
    this.syncDataToDB()
    return { id: task.id }
  }

  async modify(dto: ModifyTaskDto) {
    const task = this.tasks.find(task => task.id === dto.id)
    if (!task) {
      throw new Error(`task not found with id: ${task.id}`)
    }
    if (dto.name)
      task.name = dto.name
    if (dto.desc)
      task.desc = dto.desc
    if (dto.type)
      task.type = dto.type
    if (dto.startAt)
      task.startAt = dto.startAt
    if (dto.endAt)
      task.endAt = dto.endAt
    if (dto.repeat)
      task.repeat = dto.repeat
    if (dto.files)
      task.files = dto.files

    this.syncDataToDB()
    return { id: task.id }
  }

  async delete(ids: number[]) {
    this.tasks = this.tasks.filter(task => !ids.includes(task.id))
    this.syncDataToDB()
  }

  async getList() {
    const list = this.tasks
    const count = this.tasks.length
    return { list, count }
  }

  async get(id: number) {
    const task = this.tasks.find(task => task.id === id)
    return task
  }
}
