import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/Auth/LoginForm";
import AuthForm from "@/components/Auth/AuthForm";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <AuthForm />
    </div>
  );
}
