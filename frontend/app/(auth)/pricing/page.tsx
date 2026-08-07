"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const router = useRouter();

  const handleSelectFree = () => {
    // 14 days free trial is already set on the backend.
    // Just navigate to the dashboard.
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            O'zingizga mos tarifni tanlang
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Teacher AI imkoniyatlaridan to'liq foydalanish uchun ta'lim jarayoningizga mos keladigan rejani tanlang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Plan 1: 14 kun Free */}
          <div className="bg-background rounded-2xl border-2 border-primary shadow-lg p-8 relative flex flex-col h-full">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Tavsiya etiladi
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Bepul sinov</h3>
              <p className="text-muted-foreground mt-2">Platforma bilan tanishish uchun</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $0
                <span className="ml-1 text-xl font-medium text-muted-foreground">/14 kun</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Cheklanmagan o'quvchilar</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">AI vazifa tekshiruvi</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Barcha funksiyalar bepul</span>
              </li>
            </ul>
            <Button onClick={handleSelectFree} className="w-full h-12 text-lg">
              Boshlash
            </Button>
          </div>

          {/* Plan 2: $5 / 3 ta guruh */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col h-full relative opacity-70">
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
              <span className="bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-lg text-lg border shadow-sm">
                Tez kunda
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Asosiy</h3>
              <p className="text-muted-foreground mt-2">Kichik o'qituvchilar va repetitorlar uchun</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $5
                <span className="ml-1 text-xl font-medium text-muted-foreground">/oy</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Maksimal 3 ta guruh</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Cheklanmagan o'quvchilar</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">AI yordamchi</span>
              </li>
            </ul>
            <Button disabled variant="outline" className="w-full h-12 text-lg">
              Tez kunda
            </Button>
          </div>

          {/* Plan 3: $10 / 8 ta guruh */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col h-full relative opacity-70">
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
              <span className="bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-lg text-lg border shadow-sm">
                Tez kunda
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Pro</h3>
              <p className="text-muted-foreground mt-2">Katta o'quv markazlari uchun ideal</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $10
                <span className="ml-1 text-xl font-medium text-muted-foreground">/oy</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Maksimal 8 ta guruh</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Cheklanmagan o'quvchilar</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-muted-foreground">Barcha Pro funksiyalar</span>
              </li>
            </ul>
            <Button disabled variant="outline" className="w-full h-12 text-lg">
              Tez kunda
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
