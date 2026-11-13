import { useState } from "react";
import { useAuth } from "@auctionit/lib";
import { Navigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPage() {
  const auth = useAuth();
  const [title, setTitle] = useState("Sign In to AuctionIt");

  if (auth.status === "authenticated") {
    if (auth.user?.passwordChanged === false) {
      return <Navigate to="/change-password" replace />;
    }
    // Always land on the Dashboard after login, regardless of where the bidder
    // was headed before authenticating.
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <AuthCard title={title}>
        <LoginForm onTitleChange={setTitle} />
      </AuthCard>
    </AuthLayout>
  );
}
