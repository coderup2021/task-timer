<script setup lang="ts"></script>

<template>
  <!-- <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/task">task</RouterLink>
  </nav> -->
  <RouterView />
</template>

<style>
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
</style>
