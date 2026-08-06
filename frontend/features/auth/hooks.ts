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
