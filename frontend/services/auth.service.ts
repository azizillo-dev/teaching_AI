import { api } from "@/lib/api";
import { 
  LoginFormData, 
  RegisterFormData, 
  VerifyEmailFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData 
} from "@/features/auth/schema";

interface TokenResponse {
  access: string;
  refresh: string;
}

export const AuthService = {
  login: async (credentials: LoginFormData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>("/auth/token/", credentials);
    return response.data;
  },
  
  register: async (data: RegisterFormData): Promise<{ detail: string }> => {
    const response = await api.post("/users/register/", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailFormData): Promise<TokenResponse & { detail: string }> => {
    const response = await api.post("/users/verify-email/", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<{ detail: string }> => {
    const response = await api.post("/users/forgot-password/", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordFormData): Promise<{ detail: string }> => {
    const response = await api.post("/users/reset-password/", data);
    return response.data;
  },
};
