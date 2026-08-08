import { api } from "@/lib/api";
import { Group, GroupCreateFormData, GroupUpdateFormData } from "@/features/groups/schema";

export const GroupsService = {
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>("/classrooms/groups/");
    return response.data;
  },
  createGroup: async (data: GroupCreateFormData): Promise<Group> => {
    const response = await api.post<Group>("/classrooms/groups/", data);
    return response.data;
  },
  updateGroup: async ({ id, data }: { id: string; data: GroupUpdateFormData }): Promise<Group> => {
    const response = await api.patch<Group>(`/classrooms/groups/${id}/`, data);
    return response.data;
  },
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/classrooms/groups/${id}/`);
  },
  joinGroup: async (data: { join_code: string; join_password: string }): Promise<Group> => {
    const response = await api.post<Group>("/classrooms/groups/join/", data);
    return response.data;
  },
  removeStudent: async ({ groupId, studentId }: { groupId: string; studentId: string }): Promise<void> => {
    await api.post(`/classrooms/groups/${groupId}/remove-student/${studentId}/`);
  },
};
