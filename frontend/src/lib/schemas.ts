import { z } from "zod";
import { TaskStatus } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type RegisterData = z.infer<typeof registerSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export type CreateTaskDto = CreateTaskFormValues & { status: TaskStatus };

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
