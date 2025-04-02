<script setup lang="ts">
import { ref, watch } from "vue";
import { XIcon, SaveIcon, ClockIcon, InfoIcon, TagIcon } from "lucide-vue-next";
import type { Task } from "../../types";

const props = defineProps<{
  task: Task | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", task: Task | null): void;
}>();

const editingTask = ref<Task | null>(null);
const isClosing = ref(false);

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      editingTask.value = { ...newTask };
    }
  },
  { immediate: true }
);

const updateTask = () => {
  emit("update", editingTask.value);
};

const closeModal = () => {
  isClosing.value = true;
  setTimeout(() => {
    emit("close");
    isClosing.value = false;
  }, 300);
};

const priorityOptions: {
  value: "low" | "medium" | "high";
  label: string;
  color: string;
}[] = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
];
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    :class="{ 'animate-fadeOut': isClosing }"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-xl max-w-2xl w-full animate-slideUp overflow-hidden"
      :class="{ 'animate-slideDown': isClosing }"
      v-if="editingTask"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-800">Edit Task</h2>
        <button
          @click="closeModal"
          class="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <x-icon class="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form @submit.prevent="updateTask" class="p-6 space-y-6">
        <div>
          <label
            for="editTitle"
            class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <tag-icon class="h-4 w-4 mr-1 text-indigo-500" />
            Task Title
          </label>
          <input
            type="text"
            id="editTitle"
            v-model="editingTask.title"
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
            required
          />
        </div>

        <div>
          <label
            for="editDescription"
            class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <info-icon class="h-4 w-4 mr-1 text-indigo-500" />
            Description
          </label>
          <textarea
            id="editDescription"
            v-model="editingTask.description"
            rows="3"
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="editDueDate"
              class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <clock-icon class="h-4 w-4 mr-1 text-indigo-500" />
              Due Date
            </label>
            <input
              type="date"
              id="editDueDate"
              v-model="editingTask.dueDate"
              class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Priority</label
            >
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in priorityOptions"
                :key="option.value"
                type="button"
                @click="editingTask.priority = option.value"
                class="px-4 py-3 border rounded-lg flex items-center justify-center transition-all duration-150"
                :class="[
                  editingTask.priority === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50',
                ]"
              >
                <span class="flex items-center">
                  <span
                    :class="`${option.color} h-3 w-3 rounded-full mr-2`"
                  ></span>
                  {{ option.label }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <save-icon class="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeOut {
  animation: fadeOut 0.3s ease-in-out forwards;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-in forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
