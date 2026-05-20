"use client";

import { TaskStatus, type Task } from "@/types";
import { Trash2, ArrowRight, ArrowLeft } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_FLOW: Record<string, TaskStatus | null> = {
  TODO: TaskStatus.IN_PROGRESS,
  IN_PROGRESS: TaskStatus.DONE,
  DONE: null,
};

const STATUS_FLOW_BACK: Record<string, TaskStatus | null> = {
  TODO: null,
  IN_PROGRESS: TaskStatus.TODO,
  DONE: TaskStatus.IN_PROGRESS,
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const nextStatus = STATUS_FLOW[task.status];
  const prevStatus = STATUS_FLOW_BACK[task.status];

  const formattedDate = new Date(task.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-snug break-words flex-1">
          {task.title}
        </h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer p-1 rounded-md hover:bg-red-50"
          title="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-[10px] text-gray-400 font-medium">
          {formattedDate}
        </span>

        <div className="flex items-center gap-1">
          {prevStatus && (
            <button
              onClick={() => onStatusChange(task.id, prevStatus)}
              className="text-xs px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors flex items-center"
              title={STATUS_LABELS[prevStatus]}
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onStatusChange(task.id, nextStatus)}
              className="text-xs px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors font-medium flex items-center gap-1"
              title={STATUS_LABELS[nextStatus]}
            >
              {task.status === "TODO" ? "В работу" : "Готово"}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
