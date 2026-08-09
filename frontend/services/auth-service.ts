import axios from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginCredentials,
  LogoutResponse,
  RegisterCredentials,
  User,
} from "@/types/auth";

export async function registerUser(
  credentials: RegisterCredentials,
): Promise<User> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    credentials,
  );

  return response.data.data;
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials,
  );

  return response.data.data;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<CurrentUserResponse>("/auth/me");

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await apiClient.post<LogoutResponse>("/auth/logout");
}
