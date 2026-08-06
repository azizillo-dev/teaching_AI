import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-destructive/10 border-destructive/20">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <p className="text-destructive font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-background border rounded-md font-medium hover:bg-muted"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
