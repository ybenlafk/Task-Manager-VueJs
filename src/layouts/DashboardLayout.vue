<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "../components/common/Sidebar.vue";
import Header from "../components/common/Header.vue";

const sidebarOpen = ref(true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar - hidden on mobile unless toggled -->
    <div
      :class="[
        'transition-all duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:sticky top-0 z-10',
      ]"
      class="fixed md:relative inset-y-0 left-0"
    >
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex flex-col flex-grow overflow-hidden">
      <Header :toggle-sidebar="toggleSidebar" />
      <main class="flex-grow p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
