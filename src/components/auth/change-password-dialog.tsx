import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@auctionit/ui";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <ChangePasswordForm
          onSuccess={() => {
            onOpenChange(false);
            navigate("/login", { replace: true });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
