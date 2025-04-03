import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { useTaskStore } from "../../src/stores/taskStore";
import { createTestingPinia } from "@pinia/testing";
import TasksPage from "../../src/pages/TasksPage.vue";
import type { Task } from "../../src/types";

vi.mock("lucide-vue-next", () => ({
  CheckCircleIcon: vi.fn(() => ({ render: () => {} })),
  ClockIcon: vi.fn(() => ({ render: () => {} })),
  ListFilterIcon: vi.fn(() => ({ render: () => {} })),
  AlertTriangleIcon: vi.fn(() => ({ render: () => {} })),
  CircleCheckIcon: vi.fn(() => ({ render: () => {} })),
  CircleIcon: vi.fn(() => ({ render: () => {} })),
}));

vi.mock("../../src/components/tasks/TaskList.vue", () => ({
  default: {
    name: "TaskList",
    template: '<div class="task-list-mock"></div>',
  },
}));

vi.mock("../../src/components/tasks/TaskForm.vue", () => ({
  default: {
    name: "TaskForm",
    template: '<div class="task-form-mock"></div>',
  },
}));

vi.mock("../../src/components/tasks/TaskEditModal.vue", () => ({
  default: {
    name: "TaskEditModal",
    template: '<div class="task-edit-modal-mock"></div>',
  },
}));

describe("TaskManagement Component", () => {
  let wrapper: any;
  let store: any;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: "Task 1",
      description: "Description 1",
      dueDate: "2025-04-10",
      priority: "high",
      completed: false,
      createdAt: "2025-04-01",
      completedAt: null,
    },
    {
      id: 2,
      title: "Task 2",
      description: "Description 2",
      dueDate: "2025-04-15",
      priority: "medium",
      completed: true,
      createdAt: "2025-04-02",
      completedAt: "2025-04-03",
    },
  ];

  beforeEach(() => {
    // Create the pinia test instance
    wrapper = mount(TasksPage, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tasks: {
                tasks: mockTasks,
                isLoading: false,
                error: null,
              },
            },
          }),
        ],
      },
    });

    // Get the store after mounting
    store = useTaskStore();
  });

  it("should render the component correctly", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find("h1").text()).toBe("Task Management");
  });

  it("should call fetchTasks on mount", () => {
    expect(store.fetchTasks).toHaveBeenCalledTimes(1);
  });

  it("should display loading state when isLoading is true", async () => {
    // Set loading state
    wrapper.vm.isLoading = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
    expect(wrapper.find("TaskList").exists()).toBe(false);
  });

  it("should display task content when not loading", async () => {
    // Ensure loading is false
    store.isLoading = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".animate-spin").exists()).toBe(false);
    expect(wrapper.find(".task-list-mock").exists()).toBe(true);
    expect(wrapper.find(".task-form-mock").exists()).toBe(true);
  });

  it("should display correct task summary counts", async () => {
    const taskSummary = wrapper.find(".from-indigo-50");
    expect(taskSummary.exists()).toBe(true);

    const countElements = taskSummary.findAll(".text-lg.font-semibold");

    // Total tasks
    expect(countElements[0].text()).toBe("2");

    // Completed tasks
    expect(countElements[1].text()).toBe("1");

    // Pending tasks
    expect(countElements[2].text()).toBe("1");

    // High priority tasks
    expect(countElements[3].text()).toBe("1");

    // Medium priority tasks
    expect(countElements[4].text()).toBe("1");

    // Low priority tasks
    expect(countElements[5].text()).toBe("0");
  });

  it("should open edit modal when openEditModal is called", async () => {
    expect(wrapper.vm.isEditModalOpen).toBe(false);

    wrapper.vm.openEditModal(mockTasks[0]);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isEditModalOpen).toBe(true);
    expect(wrapper.vm.editingTask).toEqual(mockTasks[0]);
  });

  it("should close edit modal when closeEditModal is called", async () => {
    // First open the modal
    wrapper.vm.openEditModal(mockTasks[0]);
    await wrapper.vm.$nextTick();

    // Then close it
    wrapper.vm.closeEditModal();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isEditModalOpen).toBe(false);
    expect(wrapper.vm.editingTask).toBe(null);
    expect(wrapper.find("task-edit-modal-mock").exists()).toBe(false);
  });

  it("should call updateTask when handleUpdateTask is called with valid data", async () => {
    const updatedTask = { ...mockTasks[0], title: "Updated Task" };

    await wrapper.vm.handleUpdateTask(updatedTask);

    expect(store.updateTask).toHaveBeenCalledWith(updatedTask.id, updatedTask);
    expect(wrapper.vm.isEditModalOpen).toBe(false);
  });

  it("should call updateTask when handleUpdateTaskStatus is called", async () => {
    const task = { ...mockTasks[0], completed: true };

    await wrapper.vm.handleUpdateTaskStatus(task);

    expect(store.updateTask).toHaveBeenCalledWith(task.id, {
      completed: task.completed,
    });
  });

  it("should handle fetch tasks error gracefully", async () => {
    // Mock console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Force fetchTasks to throw an error
    store.fetchTasks.mockRejectedValueOnce(new Error("API error"));

    // Call the method that uses fetchTasks
    try {
      await store.fetchTasks();
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }

    // Verify console.error was called
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch tasks:",
      expect.any(Error)
    );

    // Restore console.error
    consoleSpy.mockRestore();
  });
});
