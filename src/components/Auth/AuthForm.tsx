import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react"; // Install lucide-react if not already
import { useState } from "react";

type LoginFormData = z.infer<typeof signInSchema>;

export default function AuthForm() {
  const navigate = useNavigate();
  const { login, isLoggingIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login({ email: data.email, password: data.password });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 sm:p-10">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-emerald-800">
          Welcome Back
        </h2>

        {/* Email Field */}
        <div>
          <Input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            {...register("email")}
            className={`transition-colors ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-emerald-500"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field with Eye Toggle */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
            className={`pr-10 transition-colors ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-emerald-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoggingIn}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg py-3 rounded-lg disabled:opacity-70 transition-all"
        >
          {isSubmitting || isLoggingIn ? "Logging in…" : "Login"}
        </Button>

        {/* Forgot Password */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-emerald-700 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}
