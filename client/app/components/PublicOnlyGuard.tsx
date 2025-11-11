import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/stores/auth";

export default function PublicOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { isAuthenticated, initialize, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check whether a token exists in localStorage
      const accessToken = localStorage.getItem("auth_access_token");

      if (accessToken) {
        // If a token exists, initialize auth state
        await initialize();
      } else {
        // If no token exists, mark the guard as ready immediately
        setReady(true);
      }
    };
    init();
  }, [initialize]);

  useEffect(() => {
    if (ready && isAuthenticated) {
      // If already signed in, redirect to the home page
      navigate("/", { replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  // Show a loader until initialization completes
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  // Once ready, render the child content (e.g., the sign-in form)
  return <>{children}</>;
}
