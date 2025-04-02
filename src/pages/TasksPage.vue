<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTaskStore } from "../stores/taskStore";
import TaskForm from "../components/tasks/TaskForm.vue";
import TaskList from "../components/tasks/TaskList.vue";
import TaskEditModal from "../components/tasks/TaskEditModal.vue";
import {
  CheckCircleIcon,
  ClockIcon,
  ListFilterIcon,
  AlertTriangleIcon,
  CircleCheckIcon,
  CircleIcon,
} from "lucide-vue-next";
import type { Task } from "../types";

const taskStore = useTaskStore();
const isLoading = ref(true);
const isEditModalOpen = ref(false);
const editingTask = ref<Task | null>(null);

const openEditModal = (task: Task) => {
  editingTask.value = { ...task };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  editingTask.value = null;
  isEditModalOpen.value = false;
};

const handleUpdateTask = async (values: Task | null) => {
  if (values) {
    await taskStore.updateTask(values.id, values);
    closeEditModal();
  }
};

const handleUpdateTaskStatus = async (task: Task) => {
  await taskStore.updateTask(task.id, { completed: task.completed });
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
      <CheckCircleIcon class="h-8 w-8 text-indigo-600 mr-3" />
      <h1 class="text-3xl font-bold text-gray-800">Task Management</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 space-y-6">
        <TaskForm @task-added="taskStore.fetchTasks()" />

        <TaskList
          :tasks="taskStore.tasks"
          @edit-task="openEditModal"
          @delete-task="taskStore.deleteTask"
          @toggle-task="taskStore.toggleTaskStatus"
          @update-task="handleUpdateTaskStatus"
        />
      </div>

      <div
        class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
      >
        <div class="p-6 border-b border-indigo-100">
          <div class="flex items-center">
            <list-filter-icon class="h-6 w-6 text-indigo-600 mr-2" />
            <h2 class="text-xl font-semibold text-gray-800">Task Summary</h2>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-indigo-100 mr-3">
                <list-filter-icon class="h-5 w-5 text-indigo-600" />
              </div>
              <span class="text-gray-600 font-medium">Total Tasks</span>
            </div>
            <span
              class="text-lg font-semibold bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.tasks.length }}
            </span>
          </div>

          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-green-100 mr-3">
                <circle-check-icon class="h-5 w-5 text-green-600" />
              </div>
              <span class="text-gray-600 font-medium">Completed</span>
            </div>
            <span
              class="text-lg font-semibold bg-green-100 text-green-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.completedTasks.length }}
            </span>
          </div>

          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-yellow-100 mr-3">
                <circle-icon class="h-5 w-5 text-yellow-600" />
              </div>
              <span class="text-gray-600 font-medium">Pending</span>
            </div>
            <span
              class="text-lg font-semibold bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.pendingTasks.length }}
            </span>
          </div>

          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-red-100 mr-3">
                <alert-triangle-icon class="h-5 w-5 text-red-600" />
              </div>
              <span class="text-gray-600 font-medium">High Priority</span>
            </div>
            <span
              class="text-lg font-semibold bg-red-100 text-red-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.highPriorityTasks.length }}
            </span>
          </div>

          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-yellow-100 mr-3">
                <clock-icon class="h-5 w-5 text-yellow-600" />
              </div>
              <span class="text-gray-600 font-medium">Medium Priority</span>
            </div>
            <span
              class="text-lg font-semibold bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.mediumPriorityTasks.length }}
            </span>
          </div>

          <div
            class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-green-100 mr-3">
                <check-circle-icon class="h-5 w-5 text-green-600" />
              </div>
              <span class="text-gray-600 font-medium">Low Priority</span>
            </div>
            <span
              class="text-lg font-semibold bg-green-100 text-green-800 py-1 px-3 rounded-full"
            >
              {{ taskStore.lowPriorityTasks.length }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <TaskEditModal
      v-if="isEditModalOpen"
      :task="editingTask"
      @close="closeEditModal"
      @update="handleUpdateTask"
    />
  </div>
</template>