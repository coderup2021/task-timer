import * as os from 'node:os'
import * as path from 'node:path'
import * as fs from 'node:fs'
import moment, { Moment } from 'moment'
import { uniq } from 'es-toolkit'
import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { TimerTask } from '../timer-task/timer-task.entity'
// import { Window } from "@doubleshot/nest-electron";

const dateFormat = 'HH:mm:ss'

/**
 * m1 比 m2 晚 则返回true
 * @param m1
 * @param m2
 * @returns
 */
function isAfterTime(m1: Moment, m2: Moment) {
  const d1 = moment
    .duration(m1.hours(), 'hours')
    .add(m1.minutes(), 'minutes')
    .add(m1.seconds(), 'seconds')
  const d2 = moment
    .duration(m2.hours(), 'hours')
    .add(m2.minutes(), 'minutes')
    .add(m2.seconds(), 'seconds')
  return d1.asSeconds() > d2.asSeconds()
}

// paths 是文件路径或者文件夹路径, 根据supportedExtensions，读取paths中所有支持的文件的路径
function getAllSupportedFile(paths: string[]) {
  const files = []
  paths.forEach((filePath) => {
    if (fs.statSync(filePath).isDirectory()) {
      const dirPath = filePath
      fs.readdirSync(dirPath).forEach((file) => {
        files.push(path.resolve(dirPath, file))
      })
    }
    else {
      files.push(filePath)
    }
  })
  return uniq(files)
}

type TimerTaskRule = TimerTask & {
  timer?: NodeJS.Timeout
  status?: 'doing'
  playIndex?: number
}

@Injectable()
export class TimerCoreService {
  dbFileDir = path.resolve(os.homedir(), '.task-timer')
  dbFileName = 'task-timer.json'
  staticDirName = 'static'
  staticDirPath = path.resolve(this.dbFileDir, this.staticDirName)
  dbFilePath = path.resolve(this.dbFileDir, this.dbFileName)
  configs: TimerTaskRule[] = []
  runningRule: TimerTaskRule | null = null
  runningRuleId: number
  nextStartTime?: NodeJS.Timeout
  nextStopTime?: NodeJS.Timeout

  constructor(
    // @Window() private readonly mainWin: BrowserWindow,
    private readonly eventEmitter: EventEmitter2,
  ) {
    console.log(
      '🚀 ~ TimerCoreService ~ dbFilePath:',
      os.homedir(),
      this.dbFilePath,
    )
    this.initConfig()
  }

  initConfig() {
    this.configs = JSON.parse(
      fs.readFileSync(this.dbFilePath, 'utf8'),
    ) as TimerTask[]
    this.configs = this.handleConfigs(this.configs)
  }

  handleConfigs(configs: TimerTask[]) {
    return configs.map((c) => {
      c.files = getAllSupportedFile(c.files)
      return c
    })
  }
  //   storeFilePathIdMapToTmp(configs) {
  //     const map = {};
  //     configs.forEach((config) => {
  //       config.audioFiles.forEach((file) => {
  //         map[file.id] = file.filePath;
  //       });
  //     });
  //     const tmpFile = path.resolve(os.tmpdir(), "filepath-id.json");
  //     console.log("tmpFile", tmpFile);
  //     fs.writeFileSync(tmpFile, JSON.stringify(map));
  //   }

  getNextPlan(configs: TimerTask[], now: Moment) {
    const tmpConfigs: (TimerTask & { startAtTimestamp: number })[] = configs
      .filter(
        config =>
          config.startAt
          && config.endAt
          && config.repeat.length > 0
          && config.files.length > 0,
      )
      .map((config) => {
        return {
          ...config,
          startAtTimestamp: moment(config.startAt, dateFormat).valueOf(),
        }
      })
      .sort((a, b) => a.startAtTimestamp - b.startAtTimestamp)
      .filter(
        config =>
          config.repeat.includes(now.day() as WeekDay)
          && isAfterTime(moment(config.startAt, dateFormat), now), // 找到开始时间比当前时间晚的
      )
    if (tmpConfigs[0]) {
      // 第一条规则就是最接近的, 需要发起定时执行的
      return configs.find(config => config.id === tmpConfigs[0].id)
    }
    return null
  }

  genNewPlayIndex(rule: TimerTaskRule) {
    let playIndex = -1
    if (
      rule.playIndex === undefined
      || rule.playIndex === rule.files.length - 1
    ) {
      playIndex = 0
    }
    else {
      playIndex = rule.playIndex + 1
    }
    return playIndex
  }

  genSymlink(filepath: string) {
    // const filepath = rule.files[rule.playIndex];
    const filename = path.basename(filepath)
    const linkPath = path.resolve(this.staticDirPath, filename)
    try {
      if (fs.existsSync(linkPath)) {
        fs.unlinkSync(linkPath)
      }
      fs.symlinkSync(filepath, linkPath)
      return true
    }
    catch (error) {
      console.log('genSymlink error', error)
      this.eventEmitter.emit('error', { error })
      return false
    }
  }

  runRule(rule: TimerTaskRule) {
    this.runningRule = rule
    this.runningRuleId = rule.id
    rule.status = 'doing'
    rule.playIndex = this.genNewPlayIndex(rule)
    console.log('new rule playIndex', rule.files[rule.playIndex])
    const filepath = rule.files[rule.playIndex]
    const filename = path.basename(filepath)
    if (this.genSymlink(filepath)) {
      this.eventEmitter.emit('audio-play', {
        src: `/${filename}`,
        filepath,
      })
    }
    else {
      this.eventEmitter.emit('audio-play', {
        src: ``,
        filepath,
      })
    }
    // TODO:
    // this.window.webContents.send("play", {
    //   //   src: "C:\\Users\\Administrator\\Desktop\\candy\\S101-Muddy-Puddles.mp3",
    //   src: `src`,
    // });

    this.startRuleFinishTimer(rule)
    this.startNextTimer()
  }

  @OnEvent('timer-task:getNextSrc')
  getNextSrc() {
    console.log('this.runningRuleId', this.runningRuleId)
    const rule = this.runningRule
    if (!rule) {
      console.error('no running rule when getNextSrc')
      return
    }
    rule.playIndex = this.genNewPlayIndex(rule)
    const filepath = rule.files[rule.playIndex]
    const filename = path.basename(filepath)

    // if (this.genSymlink(filepath)) {
    //   return {
    //     src: `/${filename}`,
    //     filepath,
    //   };
    // } else {
    //   return {
    //     src: ``,
    //     filepath,
    //   };
    // }
    if (this.genSymlink(filepath)) {
      console.log('next src', `/${filename}`)
      this.eventEmitter.emit('timer-task:nextSrc', {
        src: `/${filename}`,
        filepath,
      })
    }
    else {
      this.eventEmitter.emit('timer-task:nextSrc', {
        src: ``,
        filepath,
      })
    }
  }

  startRuleTimer(rule: TimerTaskRule, delay) {
    console.log('🚀 ~ startRuleTimer ~ delay:', delay)
    rule.timer = setTimeout(() => {
      this.runRule(rule)
    }, delay)
  }

  // 设置播放结束的定时
  startRuleFinishTimer(rule: TimerTaskRule) {
    const endTime = moment(rule.endAt, dateFormat)
    const diff = endTime.diff(moment())
    this.nextStopTime = setTimeout(() => {
      console.log(
        'endTime arrived, stop play',
        moment().format('YYYY-MM-DD HH:mm:ss'),
      )
      this.eventEmitter.emit('audio-stop')
    }, diff)
  }

  run() {
    this.startNextTimer()
  }

  startNextTimer() {
    const now = moment()
    const rule = this.getNextPlan(this.configs, now)
    console.log('found rule when startNextTimer:', rule)
    if (rule) {
      const startTime = moment(rule.startAt, dateFormat)
      const diff = now.diff(startTime)
      if (diff < 0) {
        // 还没到时间
        this.startRuleTimer(rule, -diff)
      }
    }
    else {
      // 晚上12:00重新启动
      console.log('no rule at today anymore, restart at tomorrow 00:00')
      const tomorrowMidnight = now
        .clone()
        .add(1, 'days')
        .startOf('day')
        .add(1, 'minute')
      this.nextStartTime = setTimeout(() => {
        this.startNextTimer()
      }, tomorrowMidnight.valueOf() - now.valueOf())
    }
  }

  clearTimer() {
    if (this.nextStartTime)
      clearTimeout(this.nextStartTime)
    if (this.nextStopTime)
      clearTimeout(this.nextStopTime)
    this.nextStartTime = null
    this.nextStopTime = null
  }

  @OnEvent('timer-task:updated')
  onTaskUpdate() {
    // if (this.runningRule) {
    //   this.eventEmitter.emit("audio-stop");
    //   this.runningRule = null;
    // }
    console.log('on timer-task:updated')
    this.clearTimer()
    this.initConfig()
    this.run()
  }
}
