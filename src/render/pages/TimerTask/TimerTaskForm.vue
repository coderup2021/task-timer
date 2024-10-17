<script lang="ts" setup>
import type { ICreateTask } from 'src/types/task.type'
import type { FormInstance, FormRules } from 'element-plus'
import moment from 'moment'
import { onMounted, reactive, ref, watch } from 'vue'
import { useTimerTaskStore } from './timer-task.store'
import { formatTime } from './utils'

const { formMode, record } = defineProps({ formMode: String, record: Object })
const emit = defineEmits(['onCancel', 'onEdit'])
const { modifyTask, createTask, selectFiles } = window.electron
const timerTaskStore = useTimerTaskStore()
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入规则名称', trigger: 'change' }],
  startAt: [
    {
      type: 'date',
      required: true,
      message: '请选择开始时间',
      trigger: 'change',
    },
  ],
  endAt: [
    {
      type: 'date',
      required: true,
      message: '请选择结束时间',
      trigger: 'change',
    },
  ],
})

const formRef = ref<FormInstance>()
// do not use same name with ref
const form = reactive<
  Omit<ICreateTask, 'startAt' | 'endAt'> & {
    startAt: Date
    endAt: Date
    id?: number
  }
>({
  id: 0,
  name: '',
  desc: '',
  type: 'PLAY_AUDIO',
  startAt: new Date(),
  endAt: new Date(),
  options: '',
  repeat: [],
  files: [],
})

console.log('🚀 ~ formMode:', formMode)

function initForm(formMode: FormMode) {
  if (formMode === 'edit' || formMode === 'view') {
    if (record.id)
      form.id = record.id
    form.name = record.name
    form.desc = record.desc
    form.type = record.type
    form.startAt = new Date(`2024-12-12 ${record.startAt}`)
    form.endAt = new Date(`2024-12-12 ${record.endAt}`)
    form.options = record.options
    form.repeat = record.repeat
    form.files = record.files
  }
  else {
    form.id = 0
    form.name = ''
    form.desc = ''
    form.startAt = new Date()
    form.endAt = new Date()
    form.repeat = []
    form.files = []
  }
}

onMounted(() => initForm(formMode as FormMode))

watch(
  () => formMode,
  (newValue, oldValue) => {
    console.log('formMode changed', newValue, oldValue)
    initForm(newValue as FormMode)
  },
)

async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid) {
      return
    }
    let { name, desc, type, startAt, endAt, repeat, files, id } = JSON.parse(
      JSON.stringify(form),
    )
    console.log({ name, desc, type, startAt, endAt, repeat, files, id })
    if (moment(startAt).isAfter(moment(endAt))) {
      ElMessage({
        message: '开始时间不能晚于结束时间',
        type: 'error',
        plain: true,
      })
      return
    }
    startAt = formatTime(startAt)
    endAt = formatTime(endAt)
    if (id) {
      await modifyTask({ name, desc, type, startAt, endAt, repeat, files, id })
    }
    else {
      await createTask({ name, desc, type, startAt, endAt, repeat, files })
    }
    timerTaskStore.fetchRemote()
    emit('onCancel')
    ElMessage({
      message: '添加规则成功',
      type: 'success',
      plain: true,
    })
  })
}

function selectPlayFiles() {
  selectFiles().then((result) => {
    if (result.canceled)
      return
    form.files = [...form.files, ...result.filePaths]
  })
}

function deleteFile(item: string) {
  form.files = form.files.filter(file => file !== item)
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    label-width="auto"
    style="max-width: 700px"
    :rules="rules"
    status-icon
    @validate="console.log"
  >
    <el-form-item label="名称" prop="name">
      <el-input v-model="form.name" :disabled="formMode === 'view'" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        v-model="form.desc"
        type="textarea"
        :disabled="formMode === 'view'"
      />
    </el-form-item>
    <el-form-item label="类型">
      <el-input v-model="form.type" :disabled="true" />
    </el-form-item>
    <el-form-item label="执行时间">
      <el-col :span="11">
        <el-time-picker
          v-model="form.startAt"
          :disabled="formMode === 'view'"
          format="HH:mm"
          placeholder="选择开始时间"
          style="width: 100%"
          prop="startAt"
        />
      </el-col>
      <el-col :span="2" class="text-center">
        <span class="text-gray-500">~</span>
      </el-col>
      <el-col :span="11">
        <el-time-picker
          v-model="form.endAt"
          :disabled="formMode === 'view'"
          format="HH:mm"
          placeholder="选择结束时间"
          style="width: 100%"
          prop="endAt"
        />
      </el-col>
    </el-form-item>
    <el-form-item label="重复">
      <el-checkbox-group v-model="form.repeat">
        <el-checkbox :value="1" name="repeat" :disabled="formMode === 'view'">
          周一
        </el-checkbox>
        <el-checkbox :value="2" name="repeat" :disabled="formMode === 'view'">
          周二
        </el-checkbox>
        <el-checkbox :value="3" name="repeat" :disabled="formMode === 'view'">
          周三
        </el-checkbox>
        <el-checkbox :value="4" name="repeat" :disabled="formMode === 'view'">
          周四
        </el-checkbox>
        <el-checkbox :value="5" name="repeat" :disabled="formMode === 'view'">
          周五
        </el-checkbox>
        <el-checkbox :value="6" name="repeat" :disabled="formMode === 'view'">
          周六
        </el-checkbox>
        <el-checkbox :value="7" name="repeat" :disabled="formMode === 'view'">
          周日
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="选择文件">
      <div class="file-content">
        <el-button
          type="primary"
          :disabled="formMode === 'view'"
          @click="selectPlayFiles"
        >
          选择文件
        </el-button>
        <ul v-if="form.files.length > 0" class="list">
          <li v-for="(item, index) in form.files" :key="item">
            <span>{{ `${index + 1}. ${item}` }}</span>
            <el-icon
              v-if="formMode !== 'view'"
              style="margin-left: 10px"
              @click="deleteFile(item)"
            >
              <Delete />
            </el-icon>
          </li>
        </ul>
      </div>
    </el-form-item>
    <el-form-item>
      <el-col :span="16" />
      <el-button
        v-if="formMode !== 'view'"
        type="primary"
        @click="onSubmit(formRef)"
      >
        保存
      </el-button>
      <el-button
        v-if="formMode === 'view'"
        type="primary"
        @click="emit('onEdit')"
      >
        编辑
      </el-button>
      <el-button @click="emit('onCancel')">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style>
.file-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.file-content .list {
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border: solid 1px #ccc;
}
.file-content ul {
  padding-left: 8px;
  padding-right: 20px;
  max-width: 100%;
  max-height: 600px;
  overflow: auto;
  box-sizing: border-box;
}
.file-content ul li {
  margin: 0;
  list-style: none;
  word-break: keep-all;
  white-space: nowrap;

  display: flex;
  align-items: center;
}
</style>
