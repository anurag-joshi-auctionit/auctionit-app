import { useAuth } from "@auctionit/lib";
import {
  AuthErrorMessages,
  AuthSuccessMessages,
  AuthValidationMessages,
} from "@auctionit/messages/auth";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputPassword,
  toast,
} from "@auctionit/ui";
import { Loading01, Lock01 } from "@untitledui/icons";
import { useForm } from "react-hook-form";
import { applyFormApiErrors } from "@/lib/api/apply-api-validation-errors";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";

type ChangePasswordFormProps = {
  /**
   * One-time token from forgot-password OTP verify.
   * When set, submits via changePasswordWithToken (no session required).
   */
  resetToken?: string | null;
  /** When true, user must change password before continuing (forced / token). */
  forced?: boolean;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
};

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordForm({
  resetToken = null,
  forced = false,
  onSuccess,
  onBackToLogin,
}: ChangePasswordFormProps) {
  const auth = useAuth();
  const usingToken = Boolean(resetToken?.trim());
  const form = useForm<ChangePasswordValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  useClearFieldErrorOnChange(form);

  const onSubmit = form.handleSubmit(async (values) => {
    const currentPassword = values.currentPassword.trim();
    const newPassword = values.newPassword.trim();
    const confirmPassword = values.confirmPassword.trim();
    try {
      if (usingToken && resetToken) {
        await auth.api.changePasswordWithToken({
          resetToken,
          currentPassword,
          newPassword,
          confirmPassword,
        });
      } else {
        await auth.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        await auth.logout();
      }
      toast.success(AuthSuccessMessages.PASSWORD_CHANGED);
      form.reset();
      onSuccess?.();
    } catch (err) {
      applyFormApiErrors(form, err, {
        fallbackMessage: AuthErrorMessages.CHANGE_PASSWORD_FAILED,
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {forced || usingToken ? (
          <p className="text-muted-foreground text-center text-sm">
            {usingToken
              ? "Enter the temporary password from your email, then choose a new password."
              : "Your password was reset. Choose a new password to continue."}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Current Password</FormLabel>
              <FormControl>
                <InputPassword
                  autoComplete="current-password"
                  autoFocus
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              {usingToken ? (
                <FormDescription>
                  Use the temporary password emailed to you.
                </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>New Password</FormLabel>
              <FormControl>
                <InputPassword
                  autoComplete="new-password"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {AuthValidationMessages.PASSWORD_HINT}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Confirm Password</FormLabel>
              <FormControl>
                <InputPassword
                  autoComplete="new-password"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
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
            <Lock01 className="size-4" />
          )}
          Change Password
        </Button>

        {onBackToLogin ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="link"
              disabled={form.formState.isSubmitting}
              onClick={onBackToLogin}
            >
              Back to Login
            </Button>
          </div>
        ) : null}
      </form>
    </Form>
  );
}
