import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { cn } from "../../lib/utils";

export type IllustratedEmptyProps = {
  title: string;
  description?: string;
  className?: string;
  /** When false, omits the no-data illustration (e.g. compact dialog use). */
  showIllustration?: boolean;
  children?: React.ReactNode;
};

export function IllustratedEmpty({
  title,
  description,
  className,
  showIllustration = true,
  children,
}: IllustratedEmptyProps) {
  return (
    <Empty className={cn("min-h-[280px] border py-12", className)}>
      {showIllustration ? (
        <EmptyMedia>
          <img
            src="/illustrations/no-data.webp"
            alt=""
            width={160}
            height={160}
            className="size-20 object-contain"
            loading="eager"
          />
        </EmptyMedia>
      ) : null}
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
    </Empty>
  );
}
