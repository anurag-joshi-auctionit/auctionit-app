import type { ReactNode } from "react";
import {
  BrandIcon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "@auctionit/ui";

type AuthCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function AuthCard({ title, children, className }: AuthCardProps) {
  return (
    <Card className={cn("mx-4 w-full max-w-md gap-8", className)}>
      <CardHeader className="flex flex-col items-center gap-3">
        <BrandIcon alt="AuctionIt" className="h-14 w-auto" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
