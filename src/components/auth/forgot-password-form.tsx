import { useAuth, type OtpChallenge } from "@auctionit/lib";
import {
  AuthErrorMessages,
  AuthSuccessMessages,
  AuthValidationMessages,
} from "@auctionit/messages/auth";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputPhone,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Separator,
  toast,
} from "@auctionit/ui";
import { Loading01, PasscodeLock } from "@untitledui/icons";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { applyFormApiErrors } from "@/lib/api/apply-api-validation-errors";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 120;

type ForgotPasswordFormProps = {
  onTitleChange?: (title: string) => void;
  onBack: () => void;
};

type IdentifyFormValues = {
  userLoginName: string;
  phone: string;
  otp: string;
};

function formatResendCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ForgotPasswordForm({
  onTitleChange,
  onBack,
}: ForgotPasswordFormProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const identifyForm = useForm<IdentifyFormValues>({
    defaultValues: { userLoginName: "", phone: "", otp: "" },
  });
  useClearFieldErrorOnChange(identifyForm);

  useEffect(() => {
    onTitleChange?.("Forgot Password");
  }, [onTitleChange]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => {
      setResendIn((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (!challenge) return;
    const id = window.requestAnimationFrame(() => {
      otpInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [challenge?.challengeId]);

  const clearChallenge = () => {
    if (!challenge) return;
    setChallenge(null);
    identifyForm.setValue("otp", "");
    identifyForm.clearErrors("otp");
    setResendIn(0);
  };

  const onSendOtp = async () => {
    const values = identifyForm.getValues();
    const userLoginName = values.userLoginName.trim();
    const phone = values.phone.trim();
    let valid = true;

    if (!userLoginName) {
      identifyForm.setError("userLoginName", {
        type: "manual",
        message: AuthValidationMessages.USERNAME_REQUIRED,
      });
      valid = false;
    }
    if (!phone) {
      identifyForm.setError("phone", {
        type: "manual",
        message: AuthValidationMessages.PHONE_REQUIRED,
      });
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      identifyForm.setError("phone", {
        type: "manual",
        message: AuthValidationMessages.INVALID_PHONE,
      });
      valid = false;
    }
    if (!valid) return;

    identifyForm.clearErrors(["userLoginName", "phone"]);
    setSendingOtp(true);
    try {
      const result = await auth.api.forgotPassword({ userLoginName, phone });
      if (result.sent) {
        toast.success(AuthSuccessMessages.FORGOT_OTP_SENT_SMS);
        setChallenge({
          challengeId: result.challengeId,
          channel: result.channel,
          destinationHint: result.destinationHint,
        });
        setResendIn(RESEND_COOLDOWN_SECONDS);
        identifyForm.setValue("otp", "");
        identifyForm.clearErrors("otp");
      } else {
        setChallenge(null);
        toast.error(AuthErrorMessages.FORGOT_ACCOUNT_NOT_FOUND_USERNAME_PHONE);
      }
    } catch (err) {
      applyFormApiErrors(identifyForm, err, {
        fallbackMessage: AuthErrorMessages.FORGOT_PASSWORD_FAILED,
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const onResendOtp = async () => {
    if (!challenge || resendIn > 0) return;
    setSendingOtp(true);
    try {
      const next = await auth.api.resendForgotPasswordOtp(challenge.challengeId);
      setChallenge(next);
      identifyForm.setValue("otp", "");
      identifyForm.clearErrors("otp");
      setResendIn(RESEND_COOLDOWN_SECONDS);
      toast.success(AuthSuccessMessages.OTP_RESENT);
    } catch (err) {
      applyFormApiErrors(identifyForm, err, {
        fallbackMessage: AuthErrorMessages.OTP_RESEND_FAILED,
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const onVerifyOtp = identifyForm.handleSubmit(async (values) => {
    if (!challenge) {
      identifyForm.setError("otp", {
        type: "server",
        message: AuthValidationMessages.VERIFY_OTP_REQUIRES_SEND,
      });
      return;
    }
    if (values.otp.length !== OTP_LENGTH) {
      identifyForm.setError("otp", {
        type: "manual",
        message: AuthValidationMessages.OTP_INVALID_LENGTH,
      });
      return;
    }
    try {
      const { resetToken: token } = await auth.api.verifyForgotPasswordOtp(
        challenge.challengeId,
        values.otp,
      );
      toast.success(AuthSuccessMessages.TEMP_PASSWORD_SENT);
      navigate(`/change-password?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
    } catch (err) {
      identifyForm.setValue("otp", "");
      applyFormApiErrors(identifyForm, err, {
        fallbackMessage: AuthErrorMessages.OTP_INVALID,
      });
    }
  });

  const verifyingOtp = identifyForm.formState.isSubmitting;
  const busy = verifyingOtp || sendingOtp;
  const otpSent = challenge != null;
  const otpValue = identifyForm.watch("otp");
  const otpComplete = otpValue.length === OTP_LENGTH;

  return (
    <Form {...identifyForm}>
      <form onSubmit={onVerifyOtp} className="space-y-4">
        <FormField
          control={identifyForm.control}
          name="userLoginName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Username</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  autoFocus
                  disabled={busy}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    clearChallenge();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={identifyForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Mobile Number</FormLabel>
              <FormControl>
                <InputPhone
                  lockCountryCode
                  placeholder="Enter mobile number"
                  disabled={busy}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearChallenge();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          className="w-full"
          disabled={busy || otpSent}
          disabledTooltip={
            otpSent ? AuthValidationMessages.SEND_OTP_USE_RESEND : undefined
          }
          onClick={() => void onSendOtp()}
        >
          {sendingOtp && !otpSent ? (
            <Loading01 className="size-4 animate-spin" />
          ) : null}
          Send OTP
        </Button>

        <FormField
          control={identifyForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>OTP</FormLabel>
              <div className="flex w-full flex-col items-center gap-2">
                <FormControl>
                  <InputOTP
                    ref={otpInputRef}
                    maxLength={OTP_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={busy || !otpSent}
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
          disabled={busy || !otpSent || !otpComplete}
          disabledTooltip={
            !otpSent
              ? AuthValidationMessages.VERIFY_OTP_REQUIRES_SEND
              : !otpComplete
                ? AuthValidationMessages.OTP_INVALID_LENGTH
                : undefined
          }
        >
          {verifyingOtp ? (
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
            disabled={busy}
            onClick={onBack}
          >
            Back to Login
          </Button>
          {otpSent ? (
            <>
              <Separator orientation="vertical" className="h-4!" />
              <Button
                type="button"
                variant="link"
                disabled={busy || resendIn > 0}
                disabledTooltip={
                  resendIn > 0
                    ? AuthErrorMessages.OTP_RESEND_TOO_SOON
                    : undefined
                }
                onClick={() => void onResendOtp()}
              >
                {sendingOtp
                  ? "Sending OTP..."
                  : resendIn > 0
                    ? `Resend OTP in ${formatResendCountdown(resendIn)}`
                    : "Resend OTP"}
              </Button>
            </>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
