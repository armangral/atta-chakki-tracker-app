
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (ignore) return;
      if (session && session.user?.id) {
        fetchRoleAndRedirect(session.user.id);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  async function fetchRoleAndRedirect(userId: string) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (data?.role === "operator") {
      navigate("/pos", { replace: true });
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });

    if (error) {
      setLoading(false);
      setError("Login failed: " + error.message);
      toast.error("Login failed: " + error.message);
      return;
    }
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.user) {
      await fetchRoleAndRedirect(session.user.id);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
      <form className="flex flex-col gap-6 w-full" onSubmit={handleLogin}>
        <div className="text-2xl font-bold mb-2 text-center">Login</div>
        <Input
          value={email}
          type="email"
          required
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          value={pwd}
          type="password"
          required
          placeholder="Password"
          onChange={e => setPwd(e.target.value)}
        />
        <Button
          type="submit"
          className="bg-emerald-700 py-3 rounded text-white font-bold text-lg hover:bg-emerald-800"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
}
