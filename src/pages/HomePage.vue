<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTaskStore } from "../stores/taskStore";
import StatCard from "../components/dashboard/StatCard.vue";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CalendarIcon,
} from "lucide-vue-next";

const taskStore = useTaskStore();
const isLoading = ref(true);

const recentTasks = computed(() => {
  return [...taskStore.tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
});

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center mb-8">
      <layout-dashboard-icon class="h-8 w-8 text-indigo-600 mr-3" />
      <h1 class="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
      ></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          :value="taskStore.tasks.length"
          icon="clipboard-list"
          color="indigo"
        />
        <StatCard
          title="Completed Tasks"
          :value="taskStore.completedTasks.length"
          icon="check-circle"
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          :value="taskStore.pendingTasks.length"
          icon="clock"
          color="yellow"
        />
        <StatCard
          title="High Priority"
          :value="taskStore.highPriorityTasks.length"
          icon="exclamation-circle"
          color="red"
        />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Recent Tasks Panel -->
        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6 border-b border-indigo-100">
            <div class="flex items-center">
              <clipboard-list-icon class="h-6 w-6 text-indigo-600 mr-2" />
              <h2 class="text-xl font-semibold text-gray-800">Recent Tasks</h2>
            </div>
          </div>

          <div class="p-6">
            <div
              v-if="recentTasks.length === 0"
              class="bg-white rounded-lg p-8 text-center shadow-sm"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
                >
                  <clipboard-list-icon class="h-8 w-8 text-indigo-400" />
                </div>
                <p class="text-gray-500 font-medium">No tasks available</p>
                <p class="text-gray-400 text-sm mt-1">
                  Add some tasks to get started
                </p>
              </div>
            </div>

            <ul v-else class="space-y-3">
              <li
                v-for="task in recentTasks"
                :key="task.id"
                class="bg-white rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md"
              >
                <div class="flex items-center">
                  <div
                    class="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                    :class="{
                      'bg-red-500': task.priority === 'high',
                      'bg-yellow-500': task.priority === 'medium',
                      'bg-green-500': task.priority === 'low',
                    }"
                  ></div>
                  <span
                    class="flex-1 font-medium"
                    :class="{ 'line-through text-gray-400': task.completed }"
                  >
                    {{ task.title }}
                  </span>
                  <div
                    class="flex items-center text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full ml-2"
                  >
                    <calendar-icon class="h-3.5 w-3.5 mr-1" />
                    <span>{{ formatDate(task.dueDate) }}</span>
                  </div>
                </div>
                <p
                  v-if="task.description"
                  class="text-sm text-gray-500 mt-2 ml-6"
                >
                  {{
                    task.description.length > 60
                      ? task.description.substring(0, 60) + "..."
                      : task.description
                  }}
                </p>
              </li>
            </ul>
          </div>
        </div>

        <!-- Priority Breakdown Panel -->
        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6 border-b border-indigo-100">
            <div class="flex items-center">
              <alert-triangle-icon class="h-6 w-6 text-indigo-600 mr-2" />
              <h2 class="text-xl font-semibold text-gray-800">
                Priority Breakdown
              </h2>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-white rounded-lg shadow-sm p-4 flex items-center">
              <div class="p-2 rounded-full bg-red-100 mr-3">
                <alert-triangle-icon class="h-5 w-5 text-red-600" />
              </div>
              <span class="text-gray-700 font-medium flex-1"
                >High Priority</span
              >
              <span
                class="text-lg font-semibold bg-red-100 text-red-800 py-1 px-3 rounded-full"
              >
                {{ taskStore.highPriorityTasks.length }}
              </span>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-4 flex items-center">
              <div class="p-2 rounded-full bg-yellow-100 mr-3">
                <clock-icon class="h-5 w-5 text-yellow-600" />
              </div>
              <span class="text-gray-700 font-medium flex-1"
                >Medium Priority</span
              >
              <span
                class="text-lg font-semibold bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full"
              >
                {{ taskStore.mediumPriorityTasks.length }}
              </span>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-4 flex items-center">
              <div class="p-2 rounded-full bg-green-100 mr-3">
                <check-circle-icon class="h-5 w-5 text-green-600" />
              </div>
              <span class="text-gray-700 font-medium flex-1">Low Priority</span>
              <span
                class="text-lg font-semibold bg-green-100 text-green-800 py-1 px-3 rounded-full"
              >
                {{ taskStore.lowPriorityTasks.length }}
              </span>
            </div>

            <div class="mt-4 pt-4 border-t border-indigo-100">
              <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                <router-link
                  :to="'/tasks'"
                  class="text-sm text-indigo-600 font-medium"
                >
                  See detailed analytics on the Analytics page
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
