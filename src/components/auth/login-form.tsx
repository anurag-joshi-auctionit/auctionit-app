import {
  AccountNotEligibleError,
  ApiError,
  useAuth,
  WrongRoleError,
  type OtpChallenge,
} from "@auctionit/lib";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputPassword,
  toast,
} from "@auctionit/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { OtpForm } from "@/components/auth/otp-form";
import { AuthErrorMessages, AuthSuccessMessages } from "@/lib/auth/messages";
import { loginSchema, type LoginFormData } from "@/lib/auth/schemas";
import { Loading01, User01 } from "@untitledui/icons";

function mapLoginError(err: unknown): string {
  if (err instanceof WrongRoleError) return AuthErrorMessages.WRONG_ROLE;
  if (err instanceof AccountNotEligibleError) {
    return AuthErrorMessages.ACCOUNT_NOT_ELIGIBLE;
  }
  if (err instanceof ApiError) {
    const body = err.body as { code?: string; error?: string } | null;
    switch (body?.code) {
      case "otp_missing_email":
        return AuthErrorMessages.OTP_MISSING_EMAIL;
      case "otp_missing_phone":
        return AuthErrorMessages.OTP_MISSING_PHONE;
      case "otp_delivery_failed":
        return AuthErrorMessages.OTP_DELIVERY_FAILED;
      default:
        if (err.status === 401) return AuthErrorMessages.INVALID_CREDENTIALS;
        return body?.error ?? AuthErrorMessages.GENERIC;
    }
  }
  return err instanceof Error ? err.message : AuthErrorMessages.GENERIC;
}

function finishPath(user: { passwordChanged?: boolean }) {
  return user.passwordChanged === false ? "/change-password" : "/";
}

type LoginFormProps = {
  onTitleChange?: (title: string) => void;
};

export function LoginForm({ onTitleChange }: LoginFormProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userLoginName: "", password: "" },
  });

  useEffect(() => {
    if (forgotMode) return;
    onTitleChange?.(
      challenge ? "Two-factor Authentication" : "Sign In to AuctionIt",
    );
  }, [challenge, forgotMode, onTitleChange]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await auth.login(data.userLoginName, data.password);
      if (result.step === "otp_required") {
        setChallenge(result.challenge);
        toast.success(
          result.challenge.channel === "email"
            ? AuthSuccessMessages.OTP_SENT_EMAIL
            : AuthSuccessMessages.OTP_SENT_SMS,
        );
        return;
      }
      toast.success(AuthSuccessMessages.SIGNED_IN);
      navigate(finishPath(result.user), { replace: true });
    } catch (err) {
      toast.error(mapLoginError(err));
    }
  };

  if (forgotMode) {
    return (
      <ForgotPasswordForm
        onTitleChange={onTitleChange}
        onBack={() => setForgotMode(false)}
      />
    );
  }

  if (challenge) {
    return (
      <OtpForm
        challenge={challenge}
        onChallengeUpdated={setChallenge}
        onBack={() => setChallenge(null)}
        onVerified={(user) => {
          navigate(finishPath(user), { replace: true });
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userLoginName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Username</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Password</FormLabel>
              <FormControl>
                <InputPassword {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loading01 className="size-4 animate-spin" />
          ) : (
            <User01 className="size-4" />
          )}
          Sign In
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Can&apos;t access your account?{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => setForgotMode(true)}
          >
            Forgot Password
          </Button>
        </p>
        <p className="text-muted-foreground text-center text-sm">
          New here?{" "}
          <Button variant="link" href="/signup" className="h-auto p-0">
            Register as Bidder
          </Button>
        </p>
      </form>
    </Form>
  );
}
