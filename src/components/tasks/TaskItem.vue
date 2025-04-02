<script setup lang="ts">
import { ref } from "vue";
import {
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  MoreVerticalIcon,
} from "lucide-vue-next";
import type { Task } from "../../types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

const props = defineProps<Props>();
const emit = defineEmits(["delete", "toggle-status"]);
const showActions = ref(false);
const isDeleting = ref(false);

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDaysRemaining = (dateString: string) => {
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${
      Math.abs(diffDays) !== 1 ? "s" : ""
    } overdue`;
  } else if (diffDays === 0) {
    return "Due today";
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
  }
};

const getDueDateClass = (dateString: string) => {
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "text-red-600";
  } else if (diffDays === 0) {
    return "text-orange-600";
  } else if (diffDays <= 3) {
    return "text-yellow-600";
  } else {
    return "text-green-600";
  }
};

const toggleCompletion = () => {
  emit("toggle-status", props.task.id);
};

const handleEdit = () => {
  props.onEdit(props.task);
  showActions.value = false;
};

const confirmDelete = () => {
  isDeleting.value = true;
};

const cancelDelete = () => {
  isDeleting.value = false;
};

const deleteTask = () => {
  emit("delete", props.task.id);
};

const toggleActions = () => {
  showActions.value = !showActions.value;
};
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 transform hover:shadow-md hover:-translate-y-1 border border-gray-100"
    :class="{ 'opacity-75': task.completed }"
  >
    <!-- Normal view -->
    <div v-if="!isDeleting" class="p-5">
      <div class="flex items-start">
        <div class="mr-4 pt-1">
          <button
            @click="toggleCompletion"
            class="h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
            :class="[
              task.completed
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-gray-300 hover:border-indigo-400',
            ]"
          >
            <check-circle-icon
              v-if="task.completed"
              class="h-5 w-5 text-white"
            />
          </button>
        </div>

        <div class="flex-grow">
          <div class="flex items-center justify-between">
            <h3
              class="text-lg font-medium text-gray-900 transition-all duration-200"
              :class="{ 'line-through text-gray-500': task.completed }"
            >
              {{ task.title }}
            </h3>

            <div class="relative">
              <button
                @click="toggleActions"
                class="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <more-vertical-icon class="h-5 w-5 text-gray-500" />
              </button>

              <div
                v-if="showActions"
                class="absolute right-0 mt-1 z-10 w-36 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
              >
                <button
                  @click="handleEdit"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <pencil-icon class="h-4 w-4 mr-2 text-gray-500" />
                  Edit Task
                </button>
                <button
                  @click="confirmDelete"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <trash-icon class="h-4 w-4 mr-2 text-red-500" />
                  Delete Task
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="task.description"
            class="mt-2 text-sm text-gray-600"
            :class="{ 'text-gray-400': task.completed }"
          >
            {{ task.description }}
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-red-100 text-red-800': task.priority === 'high',
                'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                'bg-green-100 text-green-800': task.priority === 'low',
              }"
            >
              {{
                task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
              }}
            </div>

            <div
              class="flex items-center text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
              :class="[getDueDateClass(task.dueDate)]"
            >
              <calendar-icon class="h-3.5 w-3.5 mr-1" />
              <span class="text-xs">{{ formatDate(task.dueDate) }}</span>
            </div>

            <div
              class="text-xs font-medium"
              :class="[getDueDateClass(task.dueDate)]"
            >
              {{ formatDaysRemaining(task.dueDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation view -->
    <div v-else class="p-5 bg-red-50">
      <div class="text-center">
        <div class="flex justify-center mb-3">
          <div class="p-2 rounded-full bg-red-100">
            <trash-icon class="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h4 class="text-base font-medium text-gray-900 mb-2">
          Delete this task?
        </h4>
        <p class="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
        <div class="flex justify-center space-x-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteTask"
            class="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
