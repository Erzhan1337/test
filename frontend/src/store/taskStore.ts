import { create } from "zustand";
import type { Task, TaskStatus } from "@/types";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  removeTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: true,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addTask: (task) =>
    set((state) => ({
      tasks: state.tasks.some((t) => t.id === task.id)
        ? state.tasks
        : [task, ...state.tasks],
    })),

  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      ),
    })),

  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
}));
