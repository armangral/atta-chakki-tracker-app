
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/Auth/AuthForm";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex-col gap-8">
      <AuthForm />
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </div>
  );
}
