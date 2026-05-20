"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, type RegisterData } from "@/lib/schemas";
import { getErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register(data);
      setAuth(response.accessToken, response.user);
      toast.success("Аккаунт успешно создан!");
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
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">
          Регистрация
        </h1>

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
          Создать аккаунт
        </Button>

        <p className="mt-6 text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </form>
  );
}
