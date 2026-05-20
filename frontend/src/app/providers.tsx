"use client";

import { Toaster } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/authStore";

function SocketManager() {
  useSocket();
  
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <SocketManager />
      {children}
    </>
  );
}
