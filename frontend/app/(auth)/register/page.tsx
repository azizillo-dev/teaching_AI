"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { 
  registerSchema, 
  verifyEmailSchema,
  type RegisterFormData,
  type VerifyEmailFormData
} from "@/features/auth/schema";
import { useRegisterMutation, useVerifyEmailMutation } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const registerMutation = useRegisterMutation();
  const verifyMutation = useVerifyEmailMutation();

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: verifyForm,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setRegisteredEmail(data.email);
        setStep("verify");
      },
    });
  };

  const onVerify = (data: VerifyEmailFormData) => {
    verifyMutation.mutate({ ...data, email: registeredEmail }, {
      onSuccess: () => {
        router.push("/pricing");
      }
    });
  };

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="z-10 text-center max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Mentor AI</h1>
          <p className="text-xl opacity-90">O'qituvchilar uchun yordamchi platforma</p>
          <div className="mt-12 opacity-80 border-t border-primary-foreground/20 pt-8">
            <p className="italic">&quot;Sun'iy intellekt orqali ta'lim sifatini oshiramiz.&quot;</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {step === "register" && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Ro'yxatdan o'tish</h2>
                <p className="text-muted-foreground mt-2">Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
              </div>

              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Ism</label>
                    <Input
                      placeholder="Ism"
                      {...registerForm("first_name")}
                      className={registerErrors.first_name ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {registerErrors.first_name && <p className="text-sm text-destructive">{registerErrors.first_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Familiya</label>
                    <Input
                      placeholder="Familiya"
                      {...registerForm("last_name")}
                      className={registerErrors.last_name ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {registerErrors.last_name && <p className="text-sm text-destructive">{registerErrors.last_name.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...registerForm("email")}
                    className={registerErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {registerErrors.email && <p className="text-sm text-destructive">{registerErrors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Parol</label>
                  <Input
                    type="password"
                    placeholder="Parol"
                    {...registerForm("password")}
                    className={registerErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {registerErrors.password && <p className="text-sm text-destructive">{registerErrors.password.message}</p>}
                </div>

                {registerMutation.isError && (
                  <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
                    Xatolik yuz berdi. Email band bo'lishi mumkin.
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kuting...
                    </>
                  ) : (
                    "Hisob yaratish"
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Hisobingiz bormi?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Tizimga kirish
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Emailni tasdiqlash</h2>
                <p className="text-muted-foreground mt-2">
                  <strong>{registeredEmail}</strong> manziliga tasdiqlash kodi yuborildi. Iltimos, kodni kiriting.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit(onVerify)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Tasdiqlash kodi</label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className={`text-center tracking-widest text-lg ${verifyErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...verifyForm("code")}
                  />
                  {verifyErrors.code && <p className="text-sm text-destructive">{verifyErrors.code.message}</p>}
                </div>

                {verifyMutation.isError && (
                  <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
                    Kod noto'g'ri yoki muddati tugagan.
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={verifyMutation.isPending}>
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kuting...
                    </>
                  ) : (
                    "Tasdiqlash"
                  )}
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
