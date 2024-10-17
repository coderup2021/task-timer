<script lang="ts" setup>
import type { IAudioPlayProps, ITask } from 'src/types/task.type'
import { onMounted, ref } from 'vue'
import { useTimerTaskStore } from './timer-task.store'
import TimerTaskForm from './TimerTaskForm.vue'

const { deleteTask, onAudioPlay, getNextSrc, onAudioStop } = window.electron
const formMode = ref<FormMode>('none')
const currPlayFilename = ref('')
const showForm = ref(false)

const deleteVisible = ref(false)
const deleteID = ref<number>(-1)
const timerTaskStore = useTimerTaskStore()
const oldRecord = ref<ITask | null>()
onMounted(timerTaskStore.fetchRemote)

function setFormMode(val: FormMode) {
  formMode.value = val
  showForm.value = formMode.value !== 'none'
}
const weekDayMap = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
}

function showDeleteConfirm(id: number) {
  deleteVisible.value = true
  deleteID.value = id
}

async function onDelete(id: number) {
  deleteVisible.value = false
  deleteID.value = -1
  await deleteTask([id])
  ElMessage.success('删除成功')
  await timerTaskStore.fetchRemote()
}

function onDetail(record: ITask) {
  setFormMode('view')
  showForm.value = true
  oldRecord.value = record
  console.log(record)
}

function onEdit() {
  setFormMode('edit')
  showForm.value = true
}

function onAdd() {
  setFormMode('add')
  showForm.value = true
  oldRecord.value = null
}

const audio = ref<HTMLAudioElement>(null)

onAudioPlay((props: IAudioPlayProps) => {
  console.log('audio play event triggered,', props)
  timerTaskStore.fetchRemote()
  currPlayFilename.value = props.src
  audio.value.src = `http://127.0.0.1:3678${props.src}`
  //   audio.value.play()
})

onAudioStop(() => {
  console.log('audio stop event triggered')
  currPlayFilename.value = ''
  audio.value.pause()
})

async function onPlayEnded() {
  await getNextSrc()
}

console.log('timerTaskStore.runningId', timerTaskStore.runningId)
</script>

<template>
  <el-row>
    <el-space>
      <h2>定时任务:</h2>
      <el-button type="primary" style="margin: 0 40px 0 20px" @click="onAdd">
        添加
      </el-button>
      <audio
        ref="audio"
        controls
        src="file://Users/lj/upload_test/pudinha.mp3"
        autoPlay
        :onEnded="onPlayEnded"
      />
      <div class="audio-playing-info">
        <span> 当前播放: </span>
        <span> {{ currPlayFilename.substring(1) }} </span>
      </div>
    </el-space>
  </el-row>
  <el-table :data="timerTaskStore.data" style="width: 90%" border>
    <el-table-column width="60" prop="status" label="状态">
      <template #default="scope">
        <span v-if="scope.row.id === timerTaskStore.runningId">
          <el-icon color="#1890ff" size="24"><VideoPlay /></el-icon>
        </span>
        <span v-else>
          <el-icon size="24"><VideoPause /></el-icon>
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="规则名" />
    <el-table-column prop="desc" label="描述" />
    <el-table-column prop="startAt" label="开始时间" />
    <el-table-column prop="endAt" label="结束时间" />
    <el-table-column prop="repeat" label="重复">
      <template #default="scope">
        <span v-if="scope.row.repeat.length < 7">
          <span
            v-for="item in scope.row.repeat"
            :key="item"
            class="table-weekday-span"
          >{{ weekDayMap[item] }}
          </span>
        </span>
        <span v-if="scope.row.repeat.length === 7">
          <span class="table-weekday-span">每天</span>
        </span>
      </template>
    </el-table-column>

    <!-- <el-table-column prop="files" label="文件名">
      <template #default="scope">
        <ul v-if="scope.row.files.length > 0" class="table-file-list">
          <li v-for="(item, index) in scope.row.files" :key="item">
            {{ `${index + 1}. ${item}` }}
          </li>
        </ul>
      </template>
    </el-table-column> -->
    <el-table-column label="操作">
      <template #default="scope">
        <el-space>
          <el-button @click="onDetail(scope.row)">
            详情
          </el-button>
          <el-popover
            :visible="deleteVisible && deleteID === scope.row.id"
            placement="top"
            :width="180"
          >
            <p>确认删除吗?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="small" text @click="deleteVisible = false">
                取消
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="onDelete(scope.row.id)"
              >
                删除
              </el-button>
            </div>
            <template #reference>
              <el-button @click="showDeleteConfirm(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-popover>
        </el-space>
      </template>
    </el-table-column>
  </el-table>
  <el-drawer
    v-model="showForm"
    direction="rtl"
    size="800"
    :title="
      formMode === 'view'
        ? '规则详情'
        : formMode === 'edit'
          ? '编辑规则'
          : '添加规则'
    "
  >
    <template #default>
      <TimerTaskForm
        :form-mode="formMode"
        :record="oldRecord"
        @on-cancel="setFormMode('none')"
        @on-edit="onEdit"
      />
    </template>
  </el-drawer>
</template>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
.table-weekday-span {
  padding: 0 2px;
}
.table-file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.table-file-list li {
  list-style: none;
  word-break: keep-all;
  white-space: nowrap;
}
.audio-playing-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
