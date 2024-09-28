<script lang="ts" setup>
import type { ITask } from 'src/types/task.type'
import { onMounted, ref } from 'vue'
import { useTimerTaskStore } from './timer-task.store'
import TimerTaskForm from './TimerTaskForm.vue'

const { deleteTask } = window.electron
const showForm = ref(false)

const deleteVisible = ref(false)
const timerTaskStore = useTimerTaskStore()
onMounted(timerTaskStore.fetchRemote)
function setShowForm(val: boolean) {
  showForm.value = val
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

async function onDelete(id: number) {
  console.log('id', id)
  deleteVisible.value = false
  await deleteTask([id])
  ElMessage.success('删除成功')
  await timerTaskStore.fetchRemote()
}
function onEdit(record: ITask) {
  console.log(record)
}
</script>

<template>
  <el-row>
    <el-space>
      <h2>定时任务:</h2>
      <el-button
        type="primary"
        style="margin-left: 20px"
        @click="setShowForm(true)"
      >
        添加
      </el-button>
    </el-space>
  </el-row>
  <el-table :data="timerTaskStore.data" style="width: 90%" border>
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

    <el-table-column prop="files" label="文件名">
      <template #default="scope">
        <ul v-if="scope.row.files.length > 0" class="table-file-list">
          <li v-for="(item, index) in scope.row.files" :key="item">
            {{ `${index + 1}. ${item}` }}
          </li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-space>
          <el-button @click="onEdit(scope.row)">
            编辑
          </el-button>
          <el-popover :visible="deleteVisible" placement="top" :width="160">
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
              <!-- <el-button @click="onDelete(scope.row.id)">删除</el-button> -->
              <el-button @click="deleteVisible = true">
                删除
              </el-button>
            </template>
          </el-popover>
        </el-space>
      </template>
    </el-table-column>
  </el-table>
  <el-drawer v-model="showForm" direction="rtl" size="800" title="添加规则">
    <template #default>
      <TimerTaskForm @on-cancel="setShowForm(false)" />
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
</style>
