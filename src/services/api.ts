import axios from 'axios';
import type { Task, TaskFormData } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: TaskFormData): Promise<Task> => {
    const newTask: Omit<Task, 'id'> = {
      ...task,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    const response = await api.post('/tasks', newTask);
    return response.data;
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  toggleTaskStatus: async (id: number, completed: boolean): Promise<Task> => {
    const update: Partial<Task> = {
      completed,
      completedAt: completed ? new Date().toISOString() : null
    };
    
    const response = await api.patch(`/tasks/${id}`, update);
    return response.data;
  }
};