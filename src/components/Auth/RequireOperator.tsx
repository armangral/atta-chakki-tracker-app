
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * A component that protects operator-only routes.
 * If not logged in, or not an operator, redirects to "/login".
 */
export default function RequireOperator({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      setLoading(true);
      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      // Check operator role
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "operator")
        .single();
      if (!error && data && data.role === "operator") {
        if (isMounted) setIsOperator(true);
      } else {
        navigate("/login", { replace: true });
      }
      setLoading(false);
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-amber-600" />
      </div>
    );
  }
  if (isOperator) return children;
  return null;
}
