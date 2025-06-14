
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({ to = "/admin", label = "Back to Dashboard" }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 mb-4 text-muted-foreground hover:text-black"
      onClick={() => navigate(to)}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </Button>
  );
}
