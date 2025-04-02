import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTaskStore } from "../../src/stores/taskStore";
import { taskApi } from "../../src/services/api";
import type { Task, TaskFormData } from "../../src/types";

// Mock the API
vi.mock("../../src/services/api", () => ({
  taskApi: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

// Task data for testing
const sampleTasks: Task[] = [
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
    dueDate: "2025-04-05",
    priority: "medium",
    completed: true,
    createdAt: "2025-04-01",
    completedAt: "2025-04-02",
  },
  {
    id: 3,
    title: "Task 3",
    description: "Description 3",
    dueDate: "2025-04-15",
    priority: "low",
    completed: false,
    createdAt: "2025-04-01",
    completedAt: null,
  },
];

describe("Task Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  describe("Getters", () => {
    it("should filter completed tasks", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      expect(store.completedTasks.length).toBe(1);
      expect(store.completedTasks[0].id).toBe(2);
    });

    it("should filter pending tasks", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      expect(store.pendingTasks.length).toBe(2);
      expect(store.pendingTasks[0].id).toBe(1);
      expect(store.pendingTasks[1].id).toBe(3);
    });

    it("should filter high priority tasks", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      expect(store.highPriorityTasks.length).toBe(1);
      expect(store.highPriorityTasks[0].id).toBe(1);
    });
  });

  describe("Actions", () => {
    it("should fetch tasks successfully", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);

      await store.fetchTasks();

      expect(taskApi.getTasks).toHaveBeenCalledTimes(1);
      expect(store.tasks.length).toBe(3);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("should handle fetch tasks error", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockRejectedValue(new Error("API Error"));

      await store.fetchTasks();

      expect(taskApi.getTasks).toHaveBeenCalledTimes(1);
      expect(store.tasks.length).toBe(0);
      expect(store.isLoading).toBe(false);
      expect(store.error).not.toBeNull();
      expect(store.error).toContain("Failed to fetch");
    });

    it("should add a task successfully", async () => {
      const store = useTaskStore();

      const newTaskData: TaskFormData = {
        title: "New Task",
        description: "New Description",
        dueDate: "2025-04-20",
        priority: "high",
      };

      const createdTask: Task = {
        ...newTaskData,
        id: 4,
        completed: false,
        createdAt: "2025-04-02",
        completedAt: null,
      };

      vi.mocked(taskApi.createTask).mockResolvedValue(createdTask);

      await store.addTask(newTaskData);

      expect(taskApi.createTask).toHaveBeenCalledWith(newTaskData);
      expect(store.tasks.length).toBe(1);
      expect(store.tasks[0]).toEqual(createdTask);
      expect(store.isLoading).toBe(false);
    });

    it("should handle add task error", async () => {
      const store = useTaskStore();

      const newTaskData: TaskFormData = {
        title: "New Task",
        description: "New Description",
        dueDate: "2025-04-20",
        priority: "high",
      };

      vi.mocked(taskApi.createTask).mockRejectedValue(new Error("API Error"));

      await expect(store.addTask(newTaskData)).rejects.toThrow();

      expect(taskApi.createTask).toHaveBeenCalledWith(newTaskData);
      expect(store.tasks.length).toBe(0);
      expect(store.isLoading).toBe(false);
    });

    it("should update a task successfully", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      const updatedTaskData: Partial<Task> = {
        title: "Updated Task 1",
        description: "Updated Description 1",
      };

      const updatedTask: Task = {
        ...sampleTasks[0],
        ...updatedTaskData,
      };

      vi.mocked(taskApi.updateTask).mockResolvedValue(updatedTask);

      await store.updateTask(1, updatedTaskData);

      expect(taskApi.updateTask).toHaveBeenCalledWith(1, updatedTaskData);
      expect(store.tasks[0].title).toBe("Updated Task 1");
      expect(store.tasks[0].description).toBe("Updated Description 1");
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("should handle update task error", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      const updatedTaskData: Partial<Task> = {
        title: "Updated Task 1",
      };

      vi.mocked(taskApi.updateTask).mockRejectedValue(new Error("API Error"));

      await store.updateTask(1, updatedTaskData);

      expect(taskApi.updateTask).toHaveBeenCalledWith(1, updatedTaskData);
      expect(store.tasks[0].title).toBe("Task 1");
      expect(store.isLoading).toBe(false);
      expect(store.error).not.toBeNull();
      expect(store.error).toContain("Failed to update");
    });

    it("should toggle task status successfully", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      const toggledTask: Task = {
        ...sampleTasks[0],
        completed: true,
        completedAt: "2025-04-02",
      };

      vi.mocked(taskApi.toggleTaskStatus).mockResolvedValue(toggledTask);

      await store.toggleTaskStatus(1);

      expect(taskApi.toggleTaskStatus).toHaveBeenCalledWith(1, true);
      expect(store.tasks[0].completed).toBe(true);
      expect(store.tasks[0].completedAt).toBe("2025-04-02");
    });

    it("should handle toggle task status error", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      vi.mocked(taskApi.toggleTaskStatus).mockRejectedValue(
        new Error("API Error")
      );

      await store.toggleTaskStatus(1);

      expect(taskApi.toggleTaskStatus).toHaveBeenCalledWith(1, true);
      expect(store.tasks[0].completed).toBe(false); // Not toggled
      expect(store.error).not.toBeNull();
      expect(store.error).toContain("Failed to update task status");
    });

    it("should delete a task successfully", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

      await store.deleteTask(1);

      expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
      expect(store.tasks.length).toBe(2);
      expect(store.tasks.find((t) => t.id === 1)).toBeUndefined();
    });

    it("should handle delete task error", async () => {
      const store = useTaskStore();

      vi.mocked(taskApi.getTasks).mockResolvedValue([...sampleTasks]);
      await store.fetchTasks();

      vi.mocked(taskApi.deleteTask).mockRejectedValue(new Error("API Error"));

      await store.deleteTask(1);

      expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
      expect(store.tasks.length).toBe(3);
      expect(store.error).not.toBeNull();
      expect(store.error).toContain("Failed to delete");
    });
  });
});
