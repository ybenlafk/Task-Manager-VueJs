export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}
