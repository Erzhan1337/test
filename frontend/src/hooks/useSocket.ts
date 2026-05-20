"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import type { TaskStatusEvent, TaskCreatedEvent, TaskDeletedEvent, Task } from "@/types";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);


  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const addTask = useTaskStore((state) => state.addTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      query: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("task:status-updated", (event: TaskStatusEvent) => {
      updateTaskStatus(event.id, event.status);
    });

    socket.on("task:created", (event: TaskCreatedEvent) => {
      const task: Task = {
        ...event,
        createdAt: typeof event.createdAt === "string" ? event.createdAt : new Date(event.createdAt).toISOString(),
        updatedAt: typeof event.updatedAt === "string" ? event.updatedAt : new Date(event.updatedAt).toISOString(),
      };
      addTask(task);
    });

    socket.on("task:deleted", (event: TaskDeletedEvent) => {
      removeTask(event.id);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, updateTaskStatus, addTask, removeTask]);

  return socketRef;
};
