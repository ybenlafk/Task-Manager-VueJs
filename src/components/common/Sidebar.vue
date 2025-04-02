<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { CheckCircleIcon, ChartBarIcon, LayoutDashboardIcon } from "lucide-vue-next";

interface MenuItem {
  name: string;
  path: string;
  icon: any;
}

const route = useRoute();
const menuItems = ref<MenuItem[]>([
  { name: "Home", path: "/", icon: LayoutDashboardIcon },
  { name: "Tasks", path: "/tasks", icon: CheckCircleIcon },
  { name: "Analytics", path: "/analytics", icon: ChartBarIcon },
]);
</script>

<template>
  <aside class="bg-indigo-700 text-white w-64 min-h-screen p-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Task Manager</h1>
    </div>
    <nav>
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.name">
          <router-link
            :to="item.path"
            class="flex items-center p-3 rounded-lg transition-colors"
            :class="
              route?.path === item.path ? 'bg-indigo-800' : 'hover:bg-indigo-600'
            "
          >
            <component :is="item.icon" class="h-5 w-5 mr-3" />
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
