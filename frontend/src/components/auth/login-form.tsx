"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginData } from "@/lib/schemas";
import { getErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(data);
      setAuth(response.accessToken, response.user);
      toast.success("Успешный вход!");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-md border border-gray-200 rounded-2xl shadow-sm bg-white p-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Вход</h1>

        <div className="w-full flex flex-col gap-4 mb-6">
          <Input
            type="email"
            placeholder="Email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            type="password"
            placeholder="Пароль"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Войти
        </Button>

        <p className="mt-6 text-sm text-gray-600">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Регистрация
          </Link>
        </p>
      </div>
    </form>
  );
}
