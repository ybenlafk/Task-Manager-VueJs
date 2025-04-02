<script setup lang="ts">
import { ref } from "vue";
import { PlusIcon, ClockIcon, InfoIcon, TagIcon } from "lucide-vue-next";
import { useTaskStore } from "../../stores/taskStore";
import type { TaskFormData } from "../../types";

const emit = defineEmits(["task-added"]);

const taskStore = useTaskStore();
const isExpanded = ref(false);

const formData = ref<TaskFormData>({
  title: "",
  description: "",
  dueDate: new Date().toISOString().split("T")[0],
  priority: "medium",
});

const submitForm = async () => {
  try {
    await taskStore.addTask({
      title: formData.value.title,
      description: formData.value.description,
      dueDate: formData.value.dueDate,
      priority: formData.value.priority,
    });
    emit("task-added", formData.value);
    formData.value = {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
    };
    isExpanded.value = false;
  } catch (error) {
    console.error("Failed to add task:", error);
  }
};

const toggleForm = () => {
  isExpanded.value = !isExpanded.value;
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
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
    <div
      class="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      :class="{ 'border-b border-gray-200': isExpanded }"
      @click="toggleForm"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="p-2 rounded-full bg-indigo-100 mr-3">
            <plus-icon class="h-5 w-5 text-indigo-600" />
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Add New Task</h2>
        </div>
        <button
          class="p-2 rounded-full hover:bg-indigo-100 transition-colors"
          @click.stop="toggleForm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500 transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <tag-icon class="h-4 w-4 mr-1 text-indigo-500" />
            Task Title
          </label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            placeholder="What needs to be done?"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
            required
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <info-icon class="h-4 w-4 mr-1 text-indigo-500" />
            Description
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Add details about this task..."
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="dueDate"
              class="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <clock-icon class="h-4 w-4 mr-1 text-indigo-500" />
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              v-model="formData.dueDate"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 p-3"
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
                @click="formData.priority = option.value"
                class="px-4 py-3 border rounded-lg flex items-center justify-center transition-all duration-150"
                :class="[
                  formData.priority === option.value
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

        <div class="flex justify-end">
          <button
            type="button"
            @click="toggleForm"
            class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <plus-icon class="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
