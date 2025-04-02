<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  nextTick,
} from "vue";
import { useTaskStore } from "../stores/taskStore";
import Chart from "chart.js/auto";
import {
  PieChartIcon,
  BarChart4Icon,
  LineChartIcon,
  PercentIcon,
  ClipboardListIcon,
  CalendarIcon,
  AlertTriangleIcon,
} from "lucide-vue-next";

const taskStore = useTaskStore();
const isLoading = ref(true);

const completionChartRef = ref<HTMLCanvasElement | null>(null);
const priorityChartRef = ref<HTMLCanvasElement | null>(null);
const timelineChartRef = ref<HTMLCanvasElement | null>(null);
let completionChart: Chart | null = null;
let priorityChart: Chart | null = null;
let timelineChart: Chart | null = null;

const completionRate = computed(() => {
  if (taskStore.tasks.length === 0) return 0;
  return Math.round(
    (taskStore.completedTasks.length / taskStore.tasks.length) * 100
  );
});

const averageTasksPerDay = computed(() => {
  if (taskStore.tasks.length === 0) return 0;

  const oldestTask = taskStore.tasks.reduce((oldest, task) => {
    const createdDate = new Date(task.createdAt).getTime();
    return createdDate < oldest ? createdDate : oldest;
  }, Date.now());

  const daysSinceOldest = Math.max(
    1,
    Math.ceil((Date.now() - oldestTask) / (1000 * 60 * 60 * 24))
  );
  return (taskStore.tasks.length / daysSinceOldest).toFixed(1);
});

const initCompletionChart = () => {
  if (!completionChartRef.value) return;

  const ctx = completionChartRef.value.getContext("2d");
  if (!ctx) return;

  const completedCount = taskStore.completedTasks.length;
  const pendingCount = taskStore.pendingTasks.length;

  if (taskStore.tasks.length === 0) return;

  if (completionChart) completionChart.destroy();

  completionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [completedCount, pendingCount],
          backgroundColor: ["#10B981", "#F59E0B"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

const initPriorityChart = () => {
  if (!priorityChartRef.value) return;

  const ctx = priorityChartRef.value.getContext("2d");
  if (!ctx) return;

  const highCount = taskStore.highPriorityTasks.length;
  const mediumCount = taskStore.mediumPriorityTasks.length;
  const lowCount = taskStore.lowPriorityTasks.length;

  // Only create chart if we have some data
  if (taskStore.tasks.length === 0) {
    console.warn("No task data available for priority chart");
    return;
  }

  // Destroy existing chart if it exists
  if (priorityChart) priorityChart.destroy();

  priorityChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["High", "Medium", "Low"],
      datasets: [
        {
          data: [highCount, mediumCount, lowCount],
          backgroundColor: ["#EF4444", "#F59E0B", "#10B981"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

const initTimelineChart = () => {
  if (!timelineChartRef.value) return;

  const ctx = timelineChartRef.value.getContext("2d");
  if (!ctx) return;

  // Only create chart if we have some data
  if (taskStore.tasks.length === 0) {
    console.warn("No task data available for timeline chart");
    return;
  }

  // Destroy existing chart if it exists
  if (timelineChart) timelineChart.destroy();

  // Get last 7 days
  const dates = [];
  const completedCounts = Array(7).fill(0);
  const createdCounts = Array(7).fill(0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date.toLocaleDateString(undefined, { weekday: "short" }));

    const dateTimestamp = date.getTime();
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const nextDayTimestamp = nextDay.getTime();

    // Count tasks completed on this day
    taskStore.completedTasks.forEach((task) => {
      if (!task.completedAt) return;

      const completedTimestamp = new Date(task.completedAt).getTime();
      if (
        completedTimestamp >= dateTimestamp &&
        completedTimestamp < nextDayTimestamp
      ) {
        completedCounts[6 - i]++;
      }
    });

    // Count tasks created on this day
    taskStore.tasks.forEach((task) => {
      const createdTimestamp = new Date(task.createdAt).getTime();
      if (
        createdTimestamp >= dateTimestamp &&
        createdTimestamp < nextDayTimestamp
      ) {
        createdCounts[6 - i]++;
      }
    });
  }

  timelineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Tasks Created",
          data: createdCounts,
          borderColor: "#6366F1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Tasks Completed",
          data: completedCounts,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
};

// Function to update all charts
const updateAllCharts = () => {
  initCompletionChart();
  initPriorityChart();
  initTimelineChart();
};

// Watch for changes in task data
watch(
  () => taskStore.tasks,
  () => {
    updateAllCharts();
  },
  { deep: true }
);

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
    isLoading.value = false;

    await nextTick();
    updateAllCharts();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  // Destroy charts to prevent memory leaks
  if (completionChart) completionChart.destroy();
  if (priorityChart) priorityChart.destroy();
  if (timelineChart) timelineChart.destroy();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center mb-8">
      <bar-chart4-icon class="h-8 w-8 text-indigo-600 mr-3" />
      <h1 class="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
      ></div>
    </div>

    <div v-else>
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center mb-2">
              <div class="p-2 rounded-full bg-indigo-100 mr-2">
                <percent-icon class="h-5 w-5 text-indigo-600" />
              </div>
              <h3 class="text-gray-700 text-sm font-medium">Completion Rate</h3>
            </div>
            <div class="mt-2 flex items-baseline">
              <p class="text-3xl font-semibold text-indigo-600">
                {{ completionRate }}%
              </p>
              <p class="ml-2 text-sm text-gray-500">of tasks completed</p>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center mb-2">
              <div class="p-2 rounded-full bg-indigo-100 mr-2">
                <clipboard-list-icon class="h-5 w-5 text-indigo-600" />
              </div>
              <h3 class="text-gray-700 text-sm font-medium">Total Tasks</h3>
            </div>
            <div class="mt-2 flex items-baseline">
              <p class="text-3xl font-semibold text-indigo-600">
                {{ taskStore.tasks.length }}
              </p>
              <p class="ml-2 text-sm text-gray-500">tasks</p>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center mb-2">
              <div class="p-2 rounded-full bg-indigo-100 mr-2">
                <calendar-icon class="h-5 w-5 text-indigo-600" />
              </div>
              <h3 class="text-gray-700 text-sm font-medium">
                Avg. Tasks Per Day
              </h3>
            </div>
            <div class="mt-2 flex items-baseline">
              <p class="text-3xl font-semibold text-indigo-600">
                {{ averageTasksPerDay }}
              </p>
              <p class="ml-2 text-sm text-gray-500">tasks/day</p>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center mb-2">
              <div class="p-2 rounded-full bg-indigo-100 mr-2">
                <alert-triangle-icon class="h-5 w-5 text-indigo-600" />
              </div>
              <h3 class="text-gray-700 text-sm font-medium">
                High Priority Tasks
              </h3>
            </div>
            <div class="mt-2 flex items-baseline">
              <p class="text-3xl font-semibold text-indigo-600">
                {{ taskStore.highPriorityTasks.length }}
              </p>
              <p class="ml-2 text-sm text-gray-500">tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6 border-b border-indigo-100">
            <div class="flex items-center">
              <pie-chart-icon class="h-6 w-6 text-indigo-600 mr-2" />
              <h2 class="text-xl font-semibold text-gray-800">
                Completion Status
              </h2>
            </div>
          </div>
          <div class="p-6">
            <div class="h-64 bg-white rounded-lg p-4 shadow-sm">
              <canvas ref="completionChartRef"></canvas>
            </div>
            <div
              v-if="taskStore.tasks.length === 0"
              class="text-center text-gray-500 pt-4"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
                >
                  <pie-chart-icon class="h-8 w-8 text-indigo-400" />
                </div>
                <p class="text-gray-500 font-medium">No task data available</p>
                <p class="text-gray-400 text-sm mt-1">
                  Add some tasks to see analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6 border-b border-indigo-100">
            <div class="flex items-center">
              <pie-chart-icon class="h-6 w-6 text-indigo-600 mr-2" />
              <h2 class="text-xl font-semibold text-gray-800">
                Priority Distribution
              </h2>
            </div>
          </div>
          <div class="p-6">
            <div class="h-64 bg-white rounded-lg p-4 shadow-sm">
              <canvas ref="priorityChartRef"></canvas>
            </div>
            <div
              v-if="taskStore.tasks.length === 0"
              class="text-center text-gray-500 pt-4"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
                >
                  <pie-chart-icon class="h-8 w-8 text-indigo-400" />
                </div>
                <p class="text-gray-500 font-medium">No task data available</p>
                <p class="text-gray-400 text-sm mt-1">
                  Add some tasks to see analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Chart -->
      <div
        class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md overflow-hidden"
      >
        <div class="p-6 border-b border-indigo-100">
          <div class="flex items-center">
            <line-chart-icon class="h-6 w-6 text-indigo-600 mr-2" />
            <h2 class="text-xl font-semibold text-gray-800">
              Task Activity (Last 7 Days)
            </h2>
          </div>
        </div>
        <div class="p-6">
          <div class="h-80 bg-white rounded-lg p-4 shadow-sm">
            <canvas ref="timelineChartRef"></canvas>
          </div>
          <div
            v-if="taskStore.tasks.length === 0"
            class="text-center text-gray-500 pt-4"
          >
            <div class="flex flex-col items-center">
              <div
                class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
              >
                <line-chart-icon class="h-8 w-8 text-indigo-400" />
              </div>
              <p class="text-gray-500 font-medium">No task data available</p>
              <p class="text-gray-400 text-sm mt-1">
                Add some tasks to see analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
