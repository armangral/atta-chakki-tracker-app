
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function AuthForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"admin" | "operator">("operator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If already logged in, redirect accordingly
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
    // eslint-disable-next-line
  }, []);

  async function fetchRoleAndRedirect(userId: string) {
    // Check user_roles table
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

  // Handle login
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
    // On success, fetch role/profile and redirect
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.user) {
      await fetchRoleAndRedirect(session.user.id);
    }
    setLoading(false);
  }

  // Handle signup (register then create profile & role)
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectUrl = window.location.origin + "/login";
    // 1. Supabase sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: { emailRedirectTo: redirectUrl }
    });

    if (error) {
      setLoading(false);
      setError("Signup failed: " + error.message);
      toast.error("Signup failed: " + error.message);
      return;
    }

    // 2. Wait for user to verify/complete sign up and log in
    let userId = data?.user?.id;
    if (!userId) {
      // Try to fetch from session (in case email confirmation is off)
      const session = (await supabase.auth.getSession()).data.session;
      userId = session?.user?.id;
    }

    if (!userId) {
      setLoading(false);
      toast.info("Check your email to verify your account then log in");
      setTab("login");
      return;
    }

    // 3. Insert profile (username)
    const { error: profileError } = await supabase.from("profiles").upsert([
      { id: userId, username }
    ]);
    if (profileError) {
      setError("Profile creation failed: " + profileError.message);
      setLoading(false);
      return;
    }

    // 4. Insert user_role
    const { error: roleError } = await supabase.from("user_roles").insert([
      { user_id: userId, role }
    ]);
    if (roleError) {
      setError("Role assignment failed: " + roleError.message);
      setLoading(false);
      return;
    }

    toast.success("Signup successful! You can now login.");
    setTab("login");
    setLoading(false);
    setEmail("");
    setPwd("");
    setUsername("");
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
      <Tabs value={tab} onValueChange={v => setTab(v as "login" | "signup")} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-8">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        {/* LOGIN */}
        <TabsContent value="login" className="w-full">
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
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
        </TabsContent>
        {/* SIGN UP */}
        <TabsContent value="signup" className="w-full">
          <form className="flex flex-col gap-6" onSubmit={handleSignUp}>
            <div className="text-2xl font-bold mb-2 text-center">Sign Up</div>
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
            <Input
              value={username}
              required
              placeholder="Username"
              onChange={e => setUsername(e.target.value)}
            />
            <div className="flex gap-3">
              <label className="font-medium flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="operator"
                  checked={role === "operator"}
                  onChange={() => setRole("operator")}
                />
                Operator
              </label>
              <label className="font-medium flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                Admin
              </label>
            </div>
            <Button
              type="submit"
              className="bg-amber-700 py-3 rounded text-white font-bold text-lg hover:bg-amber-800"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
            {error && <div className="text-red-600 text-center">{error}</div>}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
