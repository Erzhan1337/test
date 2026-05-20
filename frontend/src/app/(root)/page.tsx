"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateTaskModal } from "@/components/kanban/create-task-modal";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { TaskService } from "@/services/task.service";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, error, setTasks, setLoading, setError } = useTaskStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await TaskService.getAll();
        setTasks(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [setTasks, setLoading, setError]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои задачи</h1>
            <p className="text-sm text-gray-500 mt-1">
              Управляйте проектами в реальном времени
            </p>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Новая задача</span>
          </Button>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        ) : (
          <KanbanBoard />
        )}

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}
