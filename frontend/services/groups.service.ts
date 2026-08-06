import { api } from "@/lib/api";
import { Group, GroupFormData } from "@/features/groups/schema";

export const GroupsService = {
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>("/classrooms/groups/");
    return response.data;
  },
  createGroup: async (data: GroupFormData): Promise<Group> => {
    const response = await api.post<Group>("/classrooms/groups/", data);
    return response.data;
  },
  updateGroup: async ({ id, data }: { id: string; data: GroupFormData }): Promise<Group> => {
    const response = await api.patch<Group>(`/classrooms/groups/${id}/`, data);
    return response.data;
  },
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/classrooms/groups/${id}/`);
  },
};
