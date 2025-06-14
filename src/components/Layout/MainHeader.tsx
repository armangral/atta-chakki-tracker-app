
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";

export default function MainHeader({ userRole }: { userRole: "admin" | "operator" }) {
  const loc = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      // Clean up client-side storage
      cleanupAuthState();
      // Try a global sign out (in case of multi-tab)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {
        // Ignore signout failures – cleanup already happened
      }
      toast({ title: "Logged out", description: "You have been successfully logged out." });
      // Full reload for safety
      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch (e) {
      toast({ title: "Logout Error", description: "Failed to log out, please try again." });
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-amber-100/80 border-b border-gray-200 shadow-sm backdrop-blur mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="text-2xl font-black tracking-wide text-amber-700 flex items-center gap-1">
          Punjab Atta Chakki
        </Link>
        <nav className="flex items-center gap-4 md:gap-8">
          {userRole === "admin" && (
            <>
              <Link to="/admin" className={`font-semibold text-gray-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition ${loc.pathname === "/admin" ? "bg-amber-200" : ""}`}>Dashboard</Link>
              <Link to="/admin/products" className={`font-semibold text-gray-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition ${loc.pathname === "/admin/products" ? "bg-amber-200" : ""}`}>Products</Link>
              <Link to="/admin/sales" className={`font-semibold text-gray-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition ${loc.pathname === "/admin/sales" ? "bg-amber-200" : ""}`}>Sales Log</Link>
              <Link to="/admin/users" className={`font-semibold text-gray-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition ${loc.pathname === "/admin/users" ? "bg-amber-200" : ""}`}>Users</Link>
            </>
          )}
          {userRole === "operator" && (
            <>
              <Link to="/pos" className={`font-semibold text-gray-700 px-3 py-1 rounded-lg hover:bg-emerald-200 transition ${loc.pathname === "/pos" ? "bg-emerald-200" : ""}`}>POS</Link>
            </>
          )}
          {/* Replace Logout link with a button for secure logout */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="font-semibold ml-2 text-gray-500 px-3 py-1 flex items-center gap-2"
            title="Logout"
          >
            <LogOut size={18} /> Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
