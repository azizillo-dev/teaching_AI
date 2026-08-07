import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/providers/AuthProvider";

export const useLoginMutation = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      login(data.access, data.refresh);
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: AuthService.register,
  });
};

export const useVerifyEmailMutation = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: AuthService.verifyEmail,
    onSuccess: (data) => {
      login(data.access, data.refresh);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: AuthService.forgotPassword,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: AuthService.resetPassword,
  });
};
