import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupsService } from "@/services/groups.service";

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: GroupsService.getGroups,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: GroupsService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.non_field_errors?.[0] || error?.response?.data?.detail || "Guruh yaratishda xatolik yuz berdi");
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: GroupsService.updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: GroupsService.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: GroupsService.joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "student"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || error?.response?.data?.non_field_errors?.[0] || "Xatolik yuz berdi");
    },
  });
};
