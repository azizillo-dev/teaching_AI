"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/features/auth/schema";
import { useLoginMutation } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side: Branding / Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="z-10 text-center max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Teacher AI</h1>
          <p className="text-xl opacity-90">AI-powered Homework Assistant</p>
          <div className="mt-12 opacity-80 border-t border-primary-foreground/20 pt-8">
            <p className="italic">&quot;Enhancing education through artificial intelligence.&quot;</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Tizimga kirish</h2>
            <p className="text-muted-foreground mt-2">Davom etish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Parol</label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Parolni unutdingizmi?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Parol"
                {...register("password")}
                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Meni eslab qolish
              </label>
            </div>

            {loginMutation.isError && (
              <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
                Email yoki parol noto&apos;g&apos;ri. Iltimos, tekshirib qayta urinib ko&apos;ring.
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Kuting...
                </>
              ) : (
                "Kirish"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Hisobingiz yo'qmi?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
