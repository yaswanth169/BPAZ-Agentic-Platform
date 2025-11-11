// components/AuthGuard.tsx
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { apiClient } from "~/lib/api-client";
import { useAuth } from "~/stores/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setUser, setIsAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Redirect to sign-in if no token is present
      if (!apiClient.isAuthenticated()) {
        setShouldRedirect(true);
        return;
      }

      // 2. Fetch the user from the backend if not already loaded
      if (!user) {
        try {
          const me = await apiClient.get("/auth/me");
          setUser(me);
          setIsAuthenticated(true);
        } catch (err) {
          // If the token is invalid, the interceptor will handle the redirect
          setUser(null);
          setIsAuthenticated(false);
          setShouldRedirect(true);
          return;
        }
      }

      setChecking(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect effect
  useEffect(() => {
    if (shouldRedirect) {
      navigate("/signin", { replace: true, state: { from: location } });
    }
  }, [shouldRedirect, navigate, location]);

  // 3. Display a loader while verifying authentication
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  // 4. Redirect as a fallback if the user is missing
  if (!isAuthenticated || !user) {
    setShouldRedirect(true);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
