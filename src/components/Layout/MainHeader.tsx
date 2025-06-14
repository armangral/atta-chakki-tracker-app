import { Link, useLocation } from "react-router-dom";

export default function MainHeader({ userRole }: { userRole: "admin" | "operator" }) {
  const loc = useLocation();
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
          <Link to="/" className="font-semibold ml-2 text-gray-500 px-3 py-1 hover:underline underline-offset-2 transition">Logout</Link>
        </nav>
      </div>
    </header>
  );
}
