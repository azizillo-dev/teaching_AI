"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService, UserProfile } from "@/services/users.service";
import { Camera, Save, X, Loader2, LogOut } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  subject: string;
  phone_number: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    subject: "",
    phone_number: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: () => UsersService.getProfile(),
  });

  const displayAvatar = selectedAvatarUrl || profile?.avatar || null;

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        bio: profile.bio || "",
        subject: profile.subject || "",
        phone_number: profile.phone_number || "",
      });
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => UsersService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      setAvatarFile(null);
      setSelectedAvatarUrl(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setSelectedAvatarUrl(url);
    }
  };

  const handleSave = () => {
    const data = new FormData();
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("bio", formData.bio);
    data.append("subject", formData.subject);
    data.append("phone_number", formData.phone_number);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }
    updateMutation.mutate(data);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        bio: profile.bio || "",
        subject: profile.subject || "",
        phone_number: profile.phone_number || "",
      });
      setSelectedAvatarUrl(null);
      setAvatarFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse space-y-8">
        <div className="h-40 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <ErrorState message="Profil ma'lumotlarini yuklashda xatolik yuz berdi." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Profil Sozlamalari</h1>
        <p className="text-sm text-muted-foreground mt-1">Shaxsiy ma'lumotlaringizni boshqaring</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm mb-6 pb-6">
        
        {/* Avatar and Name */}
        <div className="flex items-center gap-4 p-5 md:p-8">
          <div className="relative group w-16 h-16 md:w-24 md:h-24 rounded-full border border-border bg-slate-100 overflow-hidden shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar.startsWith("http") || displayAvatar.startsWith("blob:") ? displayAvatar : `http://localhost:8000${displayAvatar}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl font-bold text-slate-400 bg-slate-100">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
            )}
            
            {isEditing && (
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-foreground truncate">{profile.first_name} {profile.last_name}</h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{profile.role === 'teacher' ? 'O\'qituvchi' : profile.role}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-0 sm:px-8 space-y-0">
          
          {/* Asosiy ma'lumotlar */}
          <div className="mb-8">
            <div className="px-5 sm:px-0 mb-4">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">Asosiy ma'lumotlar</h3>
              <p className="text-xs text-muted-foreground mt-1">Platformada ishlatiladigan asosiy profilingiz</p>
            </div>
            
            <div className="flex flex-col border-y sm:border sm:rounded-xl divide-y bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ism</span>
                </div>
                <div className="w-full sm:w-2/3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={formData.first_name}
                      onChange={e => setFormData({...formData, first_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{profile.first_name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Familiya</span>
                </div>
                <div className="w-full sm:w-2/3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={formData.last_name}
                      onChange={e => setFormData({...formData, last_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{profile.last_name}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                </div>
                <div className="w-full sm:w-2/3 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Qo'shimcha ma'lumotlar */}
          <div>
            <div className="px-5 sm:px-0 mb-4">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">Qo'shimcha ma'lumotlar</h3>
              <p className="text-xs text-muted-foreground mt-1">O'quvchilar ko'rishi mumkin bo'lgan qo'shimcha ma'lumotlar</p>
            </div>
            
            <div className="flex flex-col border-y sm:border sm:rounded-xl divide-y bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fan</span>
                </div>
                <div className="w-full sm:w-2/3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      placeholder="Masalan: Matematika"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{profile.subject || <span className="text-muted-foreground italic font-normal">Kiritilmagan</span>}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefon raqam</span>
                </div>
                <div className="w-full sm:w-2/3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      placeholder="+998 90 123 45 67"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={formData.phone_number}
                      onChange={e => setFormData({...formData, phone_number: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{profile.phone_number || <span className="text-muted-foreground italic font-normal">Kiritilmagan</span>}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="w-full sm:w-1/3 mb-2 sm:mb-0 sm:pt-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">O'zi haqida (Bio)</span>
                </div>
                <div className="w-full sm:w-2/3">
                  {isEditing ? (
                    <textarea 
                      placeholder="O'zingiz haqingizda qisqacha ma'lumot..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{profile.bio || <span className="text-muted-foreground italic font-normal">Kiritilmagan</span>}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Actions */}
        <div className="px-6 md:px-8 mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              Tahrirlash
            </Button>
          ) : (
            <>
              <Button onClick={cancelEdit} variant="outline" className="w-full sm:w-auto">
                <X className="w-4 h-4 mr-2" /> Bekor qilish
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full sm:w-auto">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Saqlash
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Tizimdan chiqish
        </Button>
      </div>
    </div>
  );
}
