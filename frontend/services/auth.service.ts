import { api } from "@/lib/api";
import { LoginFormData } from "@/features/auth/schema";

interface TokenResponse {
  access: string;
  refresh: string;
}

export const AuthService = {
  login: async (credentials: LoginFormData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>("/auth/token/", credentials);
    return response.data;
  },
};
