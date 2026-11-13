import { ApiError, useAuth } from "@auctionit/lib";
import {
  BiddersErrorMessages,
  BiddersSuccessMessages,
} from "@auctionit/messages/bidders";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputPhone,
  toast,
} from "@auctionit/ui";
import { CheckCircle, Loading02, User01, XCircle } from "@untitledui/icons";
import { useRef, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  GstinInput,
  PanInput,
  PincodeInput,
} from "@/components/shared/formatted-inputs";
import { SignupLocationSelect } from "@/components/signup/signup-location-select";
import { SignupMaterialsSelect } from "@/components/signup/signup-materials-select";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";
import {
  emptySignupFormValues,
  SIGNUP_STEPS,
  signupStepIndexForField,
  toSignupRequestBody,
  type SignupFormValues,
} from "@/lib/signup/signup-form-schema";

type SignupErrorBody = {
  error?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

type UsernameAvailabilityFeedback = {
  status: "available" | "unavailable";
  message: string;
};

function applySignupFieldErrors(
  form: UseFormReturn<SignupFormValues>,
  fieldErrors: Record<string, string[]>,
): number {
  let firstStep: number | null = null;
  for (const [apiPath, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    const formPath = apiPath === "locationId" ? "location" : apiPath;
    const step = signupStepIndexForField(formPath);
    if (firstStep === null || step < firstStep) firstStep = step;
    if (formPath === "location") {
      form.setError("location", { type: "server", message });
      continue;
    }
    if (formPath in form.getValues()) {
      form.setError(formPath as keyof SignupFormValues, {
        type: "server",
        message,
      });
    }
  }
  return firstStep ?? 0;
}

function CompanyStepFields({
  form,
}: {
  form: UseFormReturn<SignupFormValues>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Company Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter company name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="gstin"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>GSTIN</FormLabel>
              <FormControl>
                <GstinInput
                  placeholder="07ABCDE1234F1Z5"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pan"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>PAN</FormLabel>
              <FormControl>
                <PanInput
                  placeholder="ABCDE1234F"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <SignupLocationSelect
                value={field.value}
                onChange={field.onChange}
                required
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Pincode</FormLabel>
              <FormControl>
                <PincodeInput
                  placeholder="560001"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="materials"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Materials</FormLabel>
            <FormControl>
              <SignupMaterialsSelect
                required
                value={field.value ?? []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function UserStepFields({
  form,
  checkingUsername,
  pending,
  usernameAvailability,
  onCheckUsername,
  onUsernameChange,
}: {
  form: UseFormReturn<SignupFormValues>;
  checkingUsername: boolean;
  pending: boolean;
  usernameAvailability: UsernameAvailabilityFeedback | null;
  onCheckUsername: () => void;
  onUsernameChange: () => void;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Full name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="userLoginName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Username</FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  autoComplete="username"
                  placeholder="Create a username for your account"
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    onUsernameChange();
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="link"
                    size="sm"
                    disabled={checkingUsername || pending}
                    onClick={onCheckUsername}
                  >
                    {checkingUsername ? (
                      <Loading02 className="size-3.5 animate-spin" />
                    ) : null}
                    Check Availability
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            {usernameAvailability?.status === "available" ? (
              <p className="text-green-foreground flex items-center gap-1 text-xs">
                <CheckCircle className="size-3 shrink-0" />
                {usernameAvailability.message}
              </p>
            ) : usernameAvailability?.status === "unavailable" ? (
              <p className="text-destructive flex items-center gap-1 text-xs">
                <XCircle className="size-3 shrink-0" />
                {usernameAvailability.message}
              </p>
            ) : (
              <FormMessage />
            )}
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="emailId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Mobile Number</FormLabel>
              <FormControl>
                <InputPhone
                  lockCountryCode
                  placeholder="Enter mobile number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailabilityFeedback | null>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  const form = useForm<SignupFormValues>({
    defaultValues: emptySignupFormValues(),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  useClearFieldErrorOnChange(form);

  if (auth.status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const checkUsernameAvailability = async () => {
    const username = form.getValues("userLoginName").trim();
    setCheckingUsername(true);
    setUsernameAvailability(null);
    form.clearErrors("userLoginName");
    try {
      const result = await auth.api.get<{
        available: boolean;
        message?: string;
      }>(
        `/auth/signup/username/available?userLoginName=${encodeURIComponent(username)}`,
      );
      if (result.available) {
        setUsernameAvailability({
          status: "available",
          message: BiddersSuccessMessages.USERNAME_AVAILABLE,
        });
      } else {
        setUsernameAvailability({
          status: "unavailable",
          message: result.message ?? BiddersErrorMessages.USERNAME_TAKEN,
        });
      }
    } catch (err) {
      const body =
        err instanceof ApiError ? (err.body as SignupErrorBody | null) : null;
      const message = body?.fieldErrors?.userLoginName?.[0];
      if (message) {
        form.setError("userLoginName", { type: "server", message });
        return;
      }
      setUsernameAvailability({
        status: "unavailable",
        message: body?.error ?? BiddersErrorMessages.USERNAME_TAKEN,
      });
    } finally {
      setCheckingUsername(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors("root");
    try {
      await auth.api.post("/auth/signup", toSignupRequestBody(values));
      toast.success(BiddersSuccessMessages.BIDDER_REGISTERED);
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as SignupErrorBody | null;
        if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
          if (body.fieldErrors.userLoginName?.[0]) {
            setUsernameAvailability(null);
          }
          const errorStep = applySignupFieldErrors(form, body.fieldErrors);
          requestAnimationFrame(() => {
            stepRefs.current[errorStep]?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
          return;
        }
        if (body?.code === "LOCATION_NOT_FOUND") {
          form.setError("location", {
            type: "server",
            message: body.error ?? BiddersErrorMessages.LOCATION_NOT_FOUND,
          });
          requestAnimationFrame(() => {
            stepRefs.current[0]?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
          return;
        }
        form.setError("root", {
          type: "server",
          message: body?.error ?? BiddersErrorMessages.FAILED_TO_REGISTER,
        });
      } else {
        form.setError("root", {
          type: "server",
          message:
            err instanceof Error
              ? err.message
              : BiddersErrorMessages.FAILED_TO_REGISTER,
        });
      }
    }
  });

  const pending = form.formState.isSubmitting;

  return (
    <AuthLayout>
      <AuthCard title="Bidder Registration" className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            {SIGNUP_STEPS.map((s, i) => (
              <section
                key={s.key}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="scroll-mt-4 space-y-5"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-sidebar-accent text-primary-foreground flex size-[22px] shrink-0 items-center justify-center rounded-md text-[11px] font-medium">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-primary text-base font-semibold leading-none">
                      {s.label}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {s.description}
                    </p>
                  </div>
                </div>
                {i === 0 ? (
                  <CompanyStepFields form={form} />
                ) : (
                  <UserStepFields
                    form={form}
                    checkingUsername={checkingUsername}
                    pending={pending}
                    usernameAvailability={usernameAvailability}
                    onCheckUsername={() => void checkUsernameAvailability()}
                    onUsernameChange={() => setUsernameAvailability(null)}
                  />
                )}
              </section>
            ))}

            {form.formState.errors.root?.message ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loading02 className="size-4 animate-spin" />
              ) : (
                <User01 className="size-4" />
              )}
              Register
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Button variant="link" href="/login" className="h-auto p-0">
                Sign In
              </Button>
            </p>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  );
}
