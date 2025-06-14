
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/Auth/LoginForm";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [tab, setTab] = useState<"admin" | "operator">("admin");
  const navigate = useNavigate();

  function handleLogin(role: "admin" | "operator") {
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/pos");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-8">
            <TabsTrigger className="text-lg py-2" value="admin">Admin Login</TabsTrigger>
            <TabsTrigger className="text-lg py-2" value="operator">Operator Login</TabsTrigger>
          </TabsList>
          <TabsContent value="admin">
            <LoginForm role="admin" onLogin={() => handleLogin("admin")} />
          </TabsContent>
          <TabsContent value="operator">
            <LoginForm role="operator" onLogin={() => handleLogin("operator")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
