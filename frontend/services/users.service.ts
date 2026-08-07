import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  subject: string | null;
  phone_number: string | null;
  created_at: string;
}

export const UsersService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/users/profile/");
    return response.data;
  },
  
  updateProfile: async (data: FormData): Promise<UserProfile> => {
    // We use FormData to support file upload (avatar)
    const response = await api.put<UserProfile>("/users/profile/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getTeacherProfile: async (groupId: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/teacher-profile/${groupId}/`);
    return response.data;
  }
};
