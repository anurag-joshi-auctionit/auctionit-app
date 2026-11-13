import { useAuth, type OtpChallenge, type SessionUser } from "@auctionit/lib";
import {
  AuthErrorMessages,
  AuthSuccessMessages,
} from "@auctionit/messages/auth";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Separator,
  toast,
} from "@auctionit/ui";
import { Loading01, PasscodeLock } from "@untitledui/icons";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { applyFormApiErrors } from "@/lib/api/apply-api-validation-errors";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 120;

type OtpFormProps = {
  challenge: OtpChallenge;
  onVerified: (user: SessionUser) => void | Promise<void>;
  onBack: () => void;
  onChallengeUpdated: (challenge: OtpChallenge) => void;
};

type OtpFormValues = {
  otp: string;
};

function formatResendCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function OtpForm({
  challenge,
  onVerified,
  onBack,
  onChallengeUpdated,
}: OtpFormProps) {
  const auth = useAuth();
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SECONDS);
  const form = useForm<OtpFormValues>({
    defaultValues: { otp: "" },
  });
  useClearFieldErrorOnChange(form);

  const channelLabel = challenge.channel === "email" ? "email" : "phone";

  useEffect(() => {
    setResendIn(RESEND_COOLDOWN_SECONDS);
    form.reset({ otp: "" });
  }, [challenge.challengeId, form]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => {
      setResendIn((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await auth.verifyLoginOtp(challenge.challengeId, values.otp);
      toast.success(AuthSuccessMessages.SIGNED_IN);
      await onVerified(user);
    } catch (err) {
      form.setValue("otp", "");
      applyFormApiErrors(form, err, {
        fallbackMessage: AuthErrorMessages.GENERIC,
      });
    }
  });

  const onResend = async () => {
    if (resendIn > 0) return;
    setResending(true);
    try {
      const next = await auth.resendLoginOtp(challenge.challengeId);
      onChallengeUpdated(next);
      toast.success(AuthSuccessMessages.OTP_RESENT);
      form.setValue("otp", "");
      form.clearErrors("otp");
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      applyFormApiErrors(form, err, {
        fallbackMessage: AuthErrorMessages.OTP_RESEND_FAILED,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-muted-foreground text-center text-sm">
          We sent a 6-digit code to your {channelLabel}{" "}
          <span className="text-foreground font-medium lowercase">
            {challenge.destinationHint}
          </span>
        </p>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>OTP</FormLabel>
              <div className="flex w-full flex-col items-center gap-2">
                <FormControl>
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                    autoFocus
                    inputMode="numeric"
                    pattern="^\d+$"
                    containerClassName="w-full max-w-md"
                  >
                    <InputOTPGroup className="w-full">
                      {Array.from({ length: OTP_LENGTH }, (_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="text-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || resending}
        >
          {form.formState.isSubmitting ? (
            <Loading01 className="size-4 animate-spin" />
          ) : (
            <PasscodeLock className="size-4" />
          )}
          Verify OTP
        </Button>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="link"
            disabled={form.formState.isSubmitting || resending}
            onClick={onBack}
          >
            Back to Login
          </Button>
          <Separator orientation="vertical" className="h-4!" />
          <Button
            type="button"
            variant="link"
            disabled={form.formState.isSubmitting || resending || resendIn > 0}
            onClick={() => void onResend()}
          >
            {resending
              ? "Sending OTP..."
              : resendIn > 0
                ? `Resend OTP in ${formatResendCountdown(resendIn)}`
                : "Resend OTP"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
