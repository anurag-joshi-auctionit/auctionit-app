import { ApiError, useAuth } from "@auctionit/lib";
import {
  BiddersErrorMessages,
  BiddersSuccessMessages,
  BiddersValidationMessages,
} from "@auctionit/messages/bidders";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import {
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  toast,
} from "@auctionit/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormSheet } from "@/components/form-sheet";
import { applyFormApiErrors } from "@/lib/api/apply-api-validation-errors";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";

type FormValues = {
  bankAccount: string;
  bankName: string;
  bankIfsc: string;
  cheque: FileList | null;
};

const emptyValues: FormValues = {
  bankAccount: "",
  bankName: "",
  bankIfsc: "",
  cheque: null,
};

export function BankAccountUpdateEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    defaultValues: emptyValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  useClearFieldErrorOnChange(form);

  useEffect(() => {
    if (!open) return;
    form.reset(emptyValues);
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const account = values.bankAccount.trim();
      const name = values.bankName.trim();
      const ifsc = values.bankIfsc.trim().toUpperCase();
      const cheque = values.cheque?.[0];

      const formData = new FormData();
      formData.append("bankAccount", account);
      formData.append("bankName", name);
      formData.append("bankIfsc", ifsc);
      if (cheque) {
        formData.append("cheque", cheque);
      }

      let res: Response;
      try {
        res = await fetch(`${api.baseUrl}/bank-account/logs`, {
          method: "POST",
          credentials: "include",
          headers: api.appHeaders(),
          body: formData,
        });
      } catch {
        throw new ApiError(
          0,
          null,
          BiddersErrorMessages.FAILED_TO_SUBMIT_BANK_UPDATE,
        );
      }

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          body &&
          typeof body === "object" &&
          "error" in body &&
          typeof (body as { error: unknown }).error === "string"
            ? (body as { error: string }).error
            : BiddersErrorMessages.FAILED_TO_SUBMIT_BANK_UPDATE;
        throw new ApiError(res.status, body, message);
      }
      return body as { message?: string };
    },
    onSuccess: (body) => {
      toast.success(
        body.message ?? BiddersSuccessMessages.BANK_UPDATE_SUBMITTED,
      );
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["bank-account-me"] });
      void queryClient.invalidateQueries({
        queryKey: ["bank-account-me", "logs"],
      });
    },
    onError: (err) => {
      applyFormApiErrors(form, err, {
        fallbackMessage: BiddersErrorMessages.FAILED_TO_SUBMIT_BANK_UPDATE,
      });
    },
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Update Bank Details"
      submitLabel="Request"
      isSubmitting={mutation.isPending}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Form {...form}>
        <div className="space-y-4">
          <Card className="bg-yellow-background text-yellow-foreground border-yellow-foreground/20">
            <CardContent>
              {BidderAccountMessages.BANK_UPDATE_FORM_HINT}
            </CardContent>
          </Card>
          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Account Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Bank Name</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankIfsc"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>IFSC Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    className="uppercase"
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cheque"
            render={({ field: { value: _value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel required>Cancelled Cheque</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => onChange(e.target.files)}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  {BiddersValidationMessages.DOCUMENT_FILE_HINT}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
