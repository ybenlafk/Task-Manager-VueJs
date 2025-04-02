<script setup lang="ts">
import { MenuIcon } from "lucide-vue-next";

defineProps<{
  toggleSidebar: () => void;
}>();
</script>

<template>
  <header class="bg-white shadow">
    <div class="flex items-center justify-between px-4 py-3">
      <button
        @click="toggleSidebar"
        class="md:hidden p-2 rounded-md hover:bg-gray-200"
      >
        <menu-icon class="h-6 w-6" />
      </button>
      <h1 class="text-xl font-semibold text-gray-800">{{ $route?.name }}</h1>
      <div class="flex items-center space-x-4">
      </div>
    </div>
  </header>
</template>
