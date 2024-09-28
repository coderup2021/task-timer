import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class TimerTask {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string

  @Column('text')
  desc: string

  @Column('string')
  type: 'PLAY_AUDIO'

  @Column('string')
  startAt: string // 格式 12:00:00

  @Column('string')
  endAt: string // 格式 12:00:00

  @Column('string')
  repeat: WeekDay[] // 格式 [1,2,3]

  @Column('string')
  files: string[] // 格式 ["/User/lj/Download/1.mp3"]

  /**
   * 规则选项: 用于制定一些更加复杂的规则
   * 格式 {"playType": "asc"} JSON对象格式
   * 字段说明
   * playType:  "asc" | "dsc" | "random"; //播放顺序, type为PLAY_AUDIO时有效
   */
  @Column('string')
  options: string

  @Column('number')
  runCount: number // 运行次数

  @CreateDateColumn({
    type: Date,
  })
  createdAt: Date

  @UpdateDateColumn({
    type: Date,
  })
  updatedAt: Date

  @DeleteDateColumn({
    type: Date,
  })
  deletedAt: Date
}
