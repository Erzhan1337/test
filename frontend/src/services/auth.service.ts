import { api } from "./api";
import type { AuthResponse } from "@/types";
import type { LoginData, RegisterData } from "@/lib/schemas";

export const AuthService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
