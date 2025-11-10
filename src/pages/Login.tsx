import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/Auth/AuthForm";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex-col gap-8 px-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo.png"
          alt="Punjab Atta Chakki Logo"
          className="w-20 h-20 object-contain drop-shadow-md"
        />
        <h1 className="text-2xl font-bold text-emerald-800">
          Punjab Atta Chakki
        </h1>
      </div>

      {/* Auth Form */}
      <AuthForm />

      {/* Home Button */}
      <Button
        variant="outline"
        className="mt-6 border-emerald-700 text-emerald-700 hover:bg-emerald-50"
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </div>
  );
}
