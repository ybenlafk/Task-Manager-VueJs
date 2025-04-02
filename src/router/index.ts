import { createRouter, createWebHistory } from "vue-router";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import HomePage from "../pages/HomePage.vue";
import TasksPage from "../pages/TasksPage.vue";
import AnalyticsPage from "../pages/AnalyticsPage.vue";

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
      },
      {
        path: "tasks",
        name: "tasks",
        component: TasksPage,
      },
      {
        path: "analytics",
        name: "analytics",
        component: AnalyticsPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
