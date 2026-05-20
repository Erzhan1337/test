import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => {
  return <Loader2 className={cn("h-6 w-6 animate-spin text-blue-600", className)} />;
};

export const FullPageSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
};
