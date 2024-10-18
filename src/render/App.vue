<script setup lang="ts"></script>

<template>
  <div class="wrapper">
    <nav>
      <RouterLink to="/" class="link" active-class="active-link">
        AI聊
      </RouterLink>
      <RouterLink to="/timer-task" class="link" active-class="active-link">
        定时功能
      </RouterLink>
    </nav>
  </div>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.logo {
  width: 400px;
  border-radius: 1rem;
  box-shadow:
    0 0 #0000,
    0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.wrapper {
  width: 100vw;
}
nav {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
.link {
  margin-right: 10px;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.75);
  padding: 10px;
  display: block;
  border-radius: 10px;
}
.active-link {
  background-color: #1890ff;
  color: #fff;
}
</style>
