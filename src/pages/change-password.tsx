import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@auctionit/lib";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export function ChangePasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token")?.trim() || null;

  if (auth.status === "loading") return null;

  if (!resetToken && auth.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  const forced = Boolean(resetToken) || auth.user?.passwordChanged === false;

  return (
    <AuthLayout>
      <AuthCard title="Change Password">
        <ChangePasswordForm
          resetToken={resetToken}
          forced={forced}
          onBackToLogin={
            resetToken
              ? () => navigate("/login", { replace: true })
              : undefined
          }
          onSuccess={() => {
            navigate("/login", { replace: true });
          }}
        />
      </AuthCard>
    </AuthLayout>
  );
}
