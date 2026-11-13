

import * as React from "react";
import { Check } from "@untitledui/icons";
import { Badge, type BadgeProps, type BadgeColorPreset } from "./badge";
import { cn } from "../../lib/utils";

export interface ChipProps extends Omit<BadgeProps, "onSelect"> {
  selectable?: boolean;
  /** Controlled selected state. When provided, chip uses blue color when true and grey when false. */
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

function Chip({
  className,
  color,
  selectable = false,
  selected: selectedProp,
  onSelect,
  children,
  onClick,
  ...props
}: ChipProps) {
  const [internalSelected, setInternalSelected] = React.useState(false);
  const isControlled = selectedProp !== undefined;
  const selected = isControlled ? selectedProp : internalSelected;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      onClick?.(e);

      if (selectable) {
        const newSelected = !selected;
        if (!isControlled) setInternalSelected(newSelected);
        onSelect?.(newSelected);
      }
    },
    [selectable, selected, isControlled, onSelect, onClick]
  );

  const effectiveColor: BadgeColorPreset | undefined =
    selectedProp !== undefined
      ? selectedProp
        ? "blue"
        : "grey"
      : color;

  return (
    <Badge
      data-slot="chip"
      color={effectiveColor}
      className={cn("gap-1", (selectable || onClick) && "cursor-pointer", className)}
      onClick={handleClick}
      {...props}
    >
      <span className="truncate">{children}</span>
      {selected && <Check className="size-3" />}
    </Badge>
  );
}

export { Chip };
