import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@auctionit/ui";
import { Loading02, Save01 } from "@untitledui/icons";
import type { FormEvent, ReactNode } from "react";

export function FormSheet({
  open,
  onOpenChange,
  title,
  onSubmit,
  isSubmitting,
  submitLabel = "Save",
  contentClassName,
  headerActions,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  submitLabel?: string;
  contentClassName?: string;
  /** When set, replaces the default Save submit button in the sheet header. */
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={
          contentClassName ??
          "flex w-full flex-col rounded-none sm:max-w-[480px]"
        }
      >
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-border items-center border-b">
            <SheetTitle>{title}</SheetTitle>
            {headerActions ?? (
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loading02 className="size-4 animate-spin" />
                ) : (
                  <Save01 className="size-4" />
                )}
                {submitLabel}
              </Button>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
