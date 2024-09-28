<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Vite + Electron & Esbuild',
  },
})

const { createTask, onReplyMsg } = window.electron

const log = ref('')
const msg = ref('')

async function sendMsg() {
  try {
    // log.value += `[render]: ${msg.value} \n`;
    // // log.value = JSON.stringify({ hello: "lj" });
    // const data = await sendMsgToMainProcess(log.value);
    // // const data = await sendMsgToMainProcess(
    // //   "[render]: " + JSON.stringify({ hello: "lj" }),
    // // );
    // console.log("recieve data");
    // log.value += `[main]: ${data}  \n`;
    await createTask({ hello: 'task' })
  }
  catch (error) {
    console.error(error)
  }
}

onReplyMsg((msg: string) => {
  log.value += `[main]: ${msg}  \n`
})
</script>

<template>
  <h1>{{ props.title }}</h1>

  <textarea v-model="log" cols="60" rows="10" disabled />
  <div style="margin-top: 20px">
    <input v-model="msg" type="text" placeholder="send msg to main process">
    <button style="margin-left: 20px" @click="sendMsg">
      Send
    </button>
  </div>
</template>

<style></style>
