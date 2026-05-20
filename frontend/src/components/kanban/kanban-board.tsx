"use client";

import { TaskStatus } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { TaskCard } from "./task-card";
import { TaskService } from "@/services/task.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/services/api";

const COLUMNS = [
  { status: TaskStatus.TODO, label: "К выполнению", color: "bg-gray-100 text-gray-700" },
  { status: TaskStatus.IN_PROGRESS, label: "В работе", color: "bg-blue-100 text-blue-700" },
  { status: TaskStatus.DONE, label: "Готово", color: "bg-green-100 text-green-700" },
];

export function KanbanBoard() {
  const tasks = useTaskStore((state) => state.tasks);

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await TaskService.update(id, { status });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TaskService.delete(id);
      toast.success("Задача удалена");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);

        return (
          <div key={column.status} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${column.color}`}>
                {column.label}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px] bg-gray-50/80 border border-gray-100 rounded-2xl p-3">
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded-xl m-2">
                  Нет задач
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
