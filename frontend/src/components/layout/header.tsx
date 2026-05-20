"use client";

import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
    } finally {
      logoutStore();
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="w-full h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">OpKit</span>
        <span className="text-sm text-gray-400 hidden sm:inline-block">Tasks</span>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600 hidden md:inline-block">
            {user.email}
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>
    </header>
  );
}
