import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../ui/spinner";

const FullPage = ({ children }) => (
  <div className="h-screen flex items-center justify-center">{children}</div>
);

function AdminProtectedRoute({ children }) {
  const navigate = useNavigate();

  // 1. Load authenticated user
  const { isLoadingUser, isAuthenticated, user } = useAuth();

  // 2. Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoadingUser) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoadingUser, navigate]);

  // 3. Show loading spinner while checking auth
  if (isLoadingUser) {
    return (
      <FullPage>
        <Spinner size="2xl" variant="blue" />
      </FullPage>
    );
  }

  // 4. Show protected content if authenticated
  if (isAuthenticated && user?.roles[0].role === "admin") {
    return children;
  }

  // 5. Otherwise, show access denied message
  return (
    <FullPage>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
        <p className="mt-4 text-white/30">
          You do not have permission to access this page.
        </p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    </FullPage>
  );
}

export default AdminProtectedRoute;
