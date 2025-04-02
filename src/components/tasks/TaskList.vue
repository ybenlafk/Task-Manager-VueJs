<script setup lang="ts">
import { ref, computed } from "vue";
import TaskItem from "./TaskItem.vue";
import { ClipboardListIcon, CheckCircleIcon, ClockIcon } from "lucide-vue-next";
import type { Task } from "../../types";

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: "edit-task", task: Task): void;
  (e: "delete-task", id: number): void;
  (e: "toggle-task", id: number): void;
  (e: "update-task", task: Task): void;
}>();

const draggingTask = ref<Task | null>(null);

const handleEdit = (task: Task) => {
  emit("edit-task", task);
};

const handleDelete = (id: number) => {
  emit("delete-task", id);
};

const handleToggleStatus = (id: number) => {
  emit("toggle-task", id);
};

const pendingTasks = computed(() => {
  return props.tasks.filter(task => !task.completed);
});

const completedTasks = computed(() => {
  return props.tasks.filter(task => task.completed);
});

const tasksByPriority = computed(() => {
  const result = {
    high: pendingTasks.value.filter(task => task.priority === 'high'),
    medium: pendingTasks.value.filter(task => task.priority === 'medium'),
    low: pendingTasks.value.filter(task => task.priority === 'low')
  };
  return result;
});

const onDragStart = (task: Task) => {
  draggingTask.value = task;
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const onDrop = (event: DragEvent, newStatus: boolean) => {
  event.preventDefault();
  if (draggingTask.value && draggingTask.value.completed !== newStatus) {
    const updatedTask = { ...draggingTask.value, completed: newStatus };
    emit("update-task", updatedTask);
    draggingTask.value = null;
  }
};
</script>

<template>
  <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden mb-6">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <clipboard-list-icon class="h-6 w-6 text-indigo-600 mr-2" />
          <h2 class="text-xl font-semibold text-gray-800">Task Board</h2>
          <span class="ml-3 py-1 px-3 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
            {{ props.tasks.length }}
          </span>
        </div>
      </div>
    </div>

    <div class="px-6 pb-6">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Pending Column -->
        <div 
          class="bg-white rounded-lg shadow-sm p-4 border-t-4 border-yellow-400"
          @dragover="onDragOver"
          @drop="onDrop($event, false)"
        >
          <div class="flex items-center mb-4">
            <clock-icon class="h-5 w-5 text-yellow-500 mr-2" />
            <h3 class="font-medium text-gray-800">Pending</h3>
            <span class="ml-2 py-1 px-2 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              {{ pendingTasks.length }}
            </span>
          </div>

          <div v-if="pendingTasks.length === 0" class="p-4 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            No pending tasks
          </div>
          
          <!-- Priority sections -->
          <div v-else class="space-y-4">
            <!-- High Priority -->
            <div v-if="tasksByPriority.high.length > 0" class="space-y-2">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <h4 class="text-xs font-medium text-gray-500">HIGH PRIORITY</h4>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="task in tasksByPriority.high" 
                  :key="task.id"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                  class="cursor-move"
                >
                  <TaskItem
                    :task="task"
                    :on-edit="handleEdit"
                    @delete="handleDelete(task.id)"
                    @toggle-status="handleToggleStatus(task.id)"
                  />
                </div>
              </div>
            </div>

            <!-- Medium Priority -->
            <div v-if="tasksByPriority.medium.length > 0" class="space-y-2">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <h4 class="text-xs font-medium text-gray-500">MEDIUM PRIORITY</h4>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="task in tasksByPriority.medium" 
                  :key="task.id"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                  class="cursor-move"
                >
                  <TaskItem
                    :task="task"
                    :on-edit="handleEdit"
                    @delete="handleDelete(task.id)"
                    @toggle-status="handleToggleStatus(task.id)"
                  />
                </div>
              </div>
            </div>

            <!-- Low Priority -->
            <div v-if="tasksByPriority.low.length > 0" class="space-y-2">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <h4 class="text-xs font-medium text-gray-500">LOW PRIORITY</h4>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="task in tasksByPriority.low" 
                  :key="task.id"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                  class="cursor-move"
                >
                  <TaskItem
                    :task="task"
                    :on-edit="handleEdit"
                    @delete="handleDelete(task.id)"
                    @toggle-status="handleToggleStatus(task.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div 
          class="bg-white rounded-lg shadow-sm p-4 border-t-4 border-green-400"
          @dragover="onDragOver"
          @drop="onDrop($event, true)"
        >
          <div class="flex items-center mb-4">
            <check-circle-icon class="h-5 w-5 text-green-500 mr-2" />
            <h3 class="font-medium text-gray-800">Completed</h3>
            <span class="ml-2 py-1 px-2 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {{ completedTasks.length }}
            </span>
          </div>

          <div v-if="completedTasks.length === 0" class="p-4 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            No completed tasks
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="task in completedTasks" 
              :key="task.id"
              draggable="true"
              @dragstart="onDragStart(task)"
              class="cursor-move"
            >
              <TaskItem
                :task="task"
                :on-edit="handleEdit"
                @delete="handleDelete(task.id)"
                @toggle-status="handleToggleStatus(task.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}
.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>