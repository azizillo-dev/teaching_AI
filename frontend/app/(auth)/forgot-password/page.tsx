"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { 
  forgotPasswordSchema, 
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData
} from "@/features/auth/schema";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"forgot" | "reset">("forgot");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const forgotMutation = useForgotPasswordMutation();
  const resetMutation = useResetPasswordMutation();

  const {
    register: forgotForm,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: resetForm,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onForgot = (data: ForgotPasswordFormData) => {
    forgotMutation.mutate(data, {
      onSuccess: () => {
        setRegisteredEmail(data.email);
        setStep("reset");
      },
    });
  };

  const onReset = (data: ResetPasswordFormData) => {
    resetMutation.mutate({ ...data, email: registeredEmail }, {
      onSuccess: () => {
        router.push("/login");
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
          
          {step === "forgot" && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Parolni tiklash</h2>
                <p className="text-muted-foreground mt-2">Pochtangizni kiriting. Biz parolni tiklash kodini yuboramiz.</p>
              </div>

              <form onSubmit={handleForgotSubmit(onForgot)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...forgotForm("email")}
                    className={forgotErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {forgotErrors.email && <p className="text-sm text-destructive">{forgotErrors.email.message}</p>}
                </div>

                {forgotMutation.isError && (
                  <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
                    Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={forgotMutation.isPending}>
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kuting...
                    </>
                  ) : (
                    "Kodni yuborish"
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    &larr; Tizimga kirishga qaytish
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Yangi parol</h2>
                <p className="text-muted-foreground mt-2">
                  <strong>{registeredEmail}</strong> manziliga yuborilgan kodni va yangi parolni kiriting.
                </p>
              </div>

              <form onSubmit={handleResetSubmit(onReset)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Tasdiqlash kodi</label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className={`text-center tracking-widest text-lg ${resetErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...resetForm("code")}
                  />
                  {resetErrors.code && <p className="text-sm text-destructive">{resetErrors.code.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Yangi parol</label>
                  <Input
                    type="password"
                    placeholder="Yangi parol"
                    {...resetForm("new_password")}
                    className={resetErrors.new_password ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {resetErrors.new_password && <p className="text-sm text-destructive">{resetErrors.new_password.message}</p>}
                </div>

                {resetMutation.isError && (
                  <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
                    Kod noto'g'ri yoki muddati tugagan.
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kuting...
                    </>
                  ) : (
                    "Parolni yangilash"
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
