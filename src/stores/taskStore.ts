import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Task, TaskFormData } from "../types";
import { taskApi } from "../services/api";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const completedTasks = computed(() => {
    return tasks.value.filter((task) => task.completed);
  });

  const pendingTasks = computed(() => {
    return tasks.value.filter((task) => !task.completed);
  });

  const highPriorityTasks = computed(() => {
    return tasks.value.filter((task) => task.priority === "high");
  });

  const mediumPriorityTasks = computed(() => {
    return tasks.value.filter((task) => task.priority === "medium");
  });

  const lowPriorityTasks = computed(() => {
    return tasks.value.filter((task) => task.priority === "low");
  });

  const fetchTasks = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      tasks.value = await taskApi.getTasks();
    } catch (err) {
      error.value = "Failed to fetch tasks. Please try again later.";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const addTask = async (newTask: TaskFormData) => {
    isLoading.value = true;
    error.value = null;

    try {
      await taskApi.createTask(newTask);
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTask = async (id: number, updatedTask: Partial<Task>) => {
    isLoading.value = true;
    error.value = null;

    try {
      const updated = await taskApi.updateTask(id, updatedTask);
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updated;
      }
    } catch (err) {
      error.value = "Failed to update task. Please try again later.";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const toggleTaskStatus = async (id: number) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    try {
      const completed = !task.completed;
      const updated = await taskApi.toggleTaskStatus(id, completed);
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updated;
      }
    } catch (err) {
      error.value = "Failed to update task status. Please try again later.";
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      tasks.value = tasks.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = "Failed to delete task. Please try again later.";
      console.error(err);
    }
  };

  return {
    tasks,
    isLoading,
    error,

    completedTasks,
    pendingTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,

    fetchTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  };
});
