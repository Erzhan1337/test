import { api } from "./api";
import type { Task } from "@/types";
import type { CreateTaskDto, UpdateTaskDto } from "@/lib/schemas";

export const TaskService = {
  async getAll(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks");
    return response.data;
  },

  async create(dto: CreateTaskDto): Promise<Task> {
    const response = await api.post<Task>("/tasks", dto);
    return response.data;
  },

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
