"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { TaskStatus } from "@/types";
import { TaskService } from "@/services/task.service";
import { getErrorMessage } from "@/services/api";
import { createTaskSchema, type CreateTaskFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
  });

  const onSubmit = async (data: CreateTaskFormValues) => {
    setIsSubmitting(true);
    try {
      await TaskService.create({ ...data, status: TaskStatus.TODO });
      toast.success("Задача создана!");
      reset();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
      <div
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Новая задача
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Название <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Что нужно сделать?"
                {...register("title")}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Описание
              </label>
              <textarea
                placeholder="Подробности задачи (необязательно)"
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
            >
              Создать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
