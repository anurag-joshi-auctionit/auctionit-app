import * as React from "react";
import { XClose } from "@untitledui/icons";
import { Badge, type BadgeProps } from "./badge";
import { cn } from "../../lib/utils";

export interface TagProps extends BadgeProps {
  onRemove?: () => void;
  removable?: boolean;
}

function Tag({
  className,
  onRemove,
  removable = false,
  children,
  ...props
}: TagProps) {
  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove],
  );

  return (
    <Badge data-slot="tag" className={cn("gap-1", className)} {...props}>
      <span className="truncate flex items-center gap-1">{children}</span>
      {removable && (
        <button
          type="button"
          data-slot="tag-remove"
          onClick={handleRemove}
          className="ml-0.5 rounded-full focus-visible:outline-none cursor-pointer"
          aria-label="Remove tag"
        >
          <XClose className="size-3" />
        </button>
      )}
    </Badge>
  );
}

export { Tag };
