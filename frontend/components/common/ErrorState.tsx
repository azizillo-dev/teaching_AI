import { AlertTriangle } from "lucide-react";

export function ErrorState({ message = "Xatolik yuz berdi." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-destructive">
      <AlertTriangle className="w-10 h-10 mb-3" />
      <p className="font-medium">{message}</p>
    </div>
  );
}
