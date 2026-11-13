import * as React from "react";
import { Check, ChevronSelectorVertical, XClose } from "@untitledui/icons";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Spinner } from "./spinner";
import { cn } from "../../lib/utils";

export interface SelectSearchMultiOption {
  value: string;
  label: string;
  key?: string;
  name?: string;
  searchText?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

function defaultFilter(value: string, search: string): number {
  if (!search.trim()) {
    return 1;
  }

  const normalizedValue = value.toLowerCase();
  const normalizedSearch = search.toLowerCase().trim();

  const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordBoundaryRegex = new RegExp(`\\b${escapedSearch}\\b`, "i");
  if (wordBoundaryRegex.test(normalizedValue)) {
    return 2;
  }

  if (normalizedValue.includes(normalizedSearch)) {
    return 1;
  }

  return 0;
}

/** Action-bar rows (Clear / Select All) stay visible while searching. */
const ACTION_ITEM_MARKERS = [" clear reset", " select all"];

function selectSearchMultiCommandFilter(
  value: string,
  search: string,
): number {
  const normalizedValue = value.toLowerCase();
  if (ACTION_ITEM_MARKERS.some((marker) => normalizedValue.includes(marker))) {
    return 1;
  }
  return defaultFilter(value, search);
}

type RegisteredOption = {
  searchText: string;
  disabled?: boolean;
};

function getMatchingOptionValues(
  options: Map<string, RegisteredOption>,
  search: string,
): string[] {
  const result: string[] = [];
  for (const [value, { searchText, disabled }] of options) {
    if (disabled) continue;
    if (defaultFilter(searchText, search) > 0) {
      result.push(value);
    }
  }
  return result;
}

function getMatchingOptionValuesFromList(
  options: SelectSearchMultiOption[],
  search: string,
): string[] {
  const result: string[] = [];
  for (const option of options) {
    if (option.disabled) continue;
    const searchText = option.searchText ?? option.label ?? option.value;
    if (defaultFilter(searchText, search) > 0) {
      result.push(option.value);
    }
  }
  return result;
}

const selectSearchMultiTriggerInvalidClasses =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

type SelectSearchMultiContextValue = {
  /** Committed selection (trigger + parent filter). */
  appliedValue: string[];
  commitValue: (value: string[]) => void;
  /** Commits an empty selection immediately and closes the popover. */
  clearPending: () => void;
  placeholder?: string;
  emptyText?: string;
  clearable: boolean;
  clearLabel: string;
  selectAll: boolean;
  selectAllLabel: string;
  registerOption: (value: string, meta: RegisteredOption) => void;
  unregisterOption: (value: string) => void;
  getMatchingOptionValues: () => string[];
  selectAllVisible: () => void;
  /** When set, Select All uses async ID fetch instead of visible options. */
  runSelectAll: () => void;
  selectAllPending: boolean;
  hasAsyncSelectAll: boolean;
  optionsRegistryVersion: number;
  notifyOptionsRegistryChanged: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  required?: boolean;
  ariaInvalid?: boolean;
};

type SelectSearchMultiItemContextValue = {
  value: string;
  selected: boolean;
  variant: "default" | "destructive";
};

const SelectSearchMultiItemContext =
  React.createContext<SelectSearchMultiItemContextValue | null>(null);

const SelectSearchMultiContext =
  React.createContext<SelectSearchMultiContextValue | null>(null);

const useSelectSearchMultiContext = () => {
  const context = React.useContext(SelectSearchMultiContext);
  if (!context) {
    throw new Error(
      "SelectSearchMulti components must be used within SelectSearchMulti",
    );
  }
  return context;
};

function SelectSearchMulti({
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Search...",
  emptyText = "No results found.",
  clearable = false,
  clearLabel = "Clear Filter",
  selectAll = true,
  selectAllLabel = "Select All",
  options: optionsProp,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  required,
  "aria-invalid": ariaInvalid,
  onSearchChange,
  onSelectAll,
  children,
  ...props
}: React.ComponentProps<typeof Popover> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  clearable?: boolean;
  clearLabel?: string;
  /** When true, shows Select All in the action bar (selects options matching the search). */
  selectAll?: boolean;
  selectAllLabel?: string;
  /** Source list for Select All matching; avoids relying on mounted items. */
  options?: SelectSearchMultiOption[];
  /** Marks the field as required; trigger shows invalid border when validation fails. */
  required?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  /** Fires with the current search text. Pair with Command `shouldFilter={false}` for server search. */
  onSearchChange?: (value: string) => void;
  /**
   * When provided, Select All fetches matching IDs (server-side) and merges them
   * into the committed selection instead of only selecting visible options.
   */
  onSelectAll?: () => Promise<string[]>;
}) {
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue ?? [],
  );
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectAllPending, setSelectAllPending] = React.useState(false);
  const optionsRef = React.useRef<Map<string, RegisteredOption>>(new Map());
  const [optionsRegistryVersion, setOptionsRegistryVersion] = React.useState(0);

  const appliedValue = valueProp ?? internalValue;
  const isControlled = valueProp !== undefined;
  const open = openProp ?? internalOpen;

  const handleSearchChange = React.useCallback(
    (newSearch: string) => {
      setSearchValue(newSearch);
      onSearchChange?.(newSearch);
    },
    [onSearchChange],
  );

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChangeProp) {
        onOpenChangeProp(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChangeProp],
  );

  const commitValue = React.useCallback(
    (next: string[]) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleSearchChange("");
      }
      setOpen(newOpen);
    },
    [setOpen, handleSearchChange],
  );

  const notifyOptionsRegistryChanged = React.useCallback(() => {
    setOptionsRegistryVersion((version) => version + 1);
  }, []);

  const clearPending = React.useCallback(() => {
    commitValue([]);
    setOpen(false);
  }, [commitValue, setOpen]);

  const registerOption = React.useCallback(
    (value: string, meta: RegisteredOption) => {
      optionsRef.current.set(value, meta);
    },
    [],
  );

  const unregisterOption = React.useCallback((value: string) => {
    optionsRef.current.delete(value);
  }, []);

  const getMatchingOptionValuesFn = React.useCallback(() => {
    if (optionsProp && optionsProp.length > 0) {
      return getMatchingOptionValuesFromList(optionsProp, searchValue);
    }
    return getMatchingOptionValues(optionsRef.current, searchValue);
  }, [optionsProp, searchValue, optionsRegistryVersion]);

  const selectAllVisible = React.useCallback(() => {
    const matching = optionsProp?.length
      ? getMatchingOptionValuesFromList(optionsProp, searchValue)
      : getMatchingOptionValues(optionsRef.current, searchValue);
    if (matching.length === 0) return;
    const next = [...new Set([...appliedValue, ...matching])];
    commitValue(next);
  }, [optionsProp, searchValue, appliedValue, commitValue]);

  const runSelectAll = React.useCallback(() => {
    if (!onSelectAll) {
      selectAllVisible();
      return;
    }
    if (selectAllPending) return;
    setSelectAllPending(true);
    void Promise.resolve(onSelectAll())
      .then((ids) => {
        if (!ids.length) return;
        const next = [...new Set([...appliedValue, ...ids])];
        commitValue(next);
      })
      .finally(() => {
        setSelectAllPending(false);
      });
  }, [
    onSelectAll,
    selectAllPending,
    selectAllVisible,
    appliedValue,
    commitValue,
  ]);

  const contextValue: SelectSearchMultiContextValue = {
    appliedValue,
    commitValue,
    clearPending,
    placeholder,
    emptyText,
    clearable,
    clearLabel,
    selectAll,
    selectAllLabel,
    registerOption,
    unregisterOption,
    getMatchingOptionValues: getMatchingOptionValuesFn,
    selectAllVisible,
    runSelectAll,
    selectAllPending,
    hasAsyncSelectAll: Boolean(onSelectAll),
    optionsRegistryVersion,
    notifyOptionsRegistryChanged,
    open,
    onOpenChange: handleOpenChange,
    searchValue,
    setSearchValue: handleSearchChange,
    required,
    ariaInvalid: ariaInvalid === true || ariaInvalid === "true",
  };

  return (
    <SelectSearchMultiContext.Provider value={contextValue}>
      <Popover open={open} modal onOpenChange={handleOpenChange} {...props}>
        {children}
      </Popover>
    </SelectSearchMultiContext.Provider>
  );
}

function SelectSearchMultiValue({
  placeholder = "Select...",
  children: _children,
  className,
  ...props
}: {
  placeholder?: string;
  /** @deprecated Ignored — trigger always shows placeholder + count badge. */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const { appliedValue } = useSelectSearchMultiContext();
  const count = appliedValue.length;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2",
        count > 0
          ? "font-medium text-foreground"
          : "font-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="truncate">{placeholder}</span>
      {count > 0 ? (
        <Badge className="shrink-0 tabular-nums">{count}</Badge>
      ) : null}
    </span>
  );
}

SelectSearchMultiValue.displayName = "SelectSearchMultiValue";

function SelectSearchMultiTrigger({
  className,
  children,
  variant = "outline",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  required: requiredProp,
  "aria-invalid": ariaInvalidProp,
  showClearButton = true,
  ...props
}: React.ComponentProps<typeof Button> & {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  asChild?: boolean;
  /** Shows a spinner on the trigger and disables interaction while options load. */
  loading?: boolean;
  /** Marks the field as required; shows a red border when validation fails. */
  required?: boolean;
  /** When clearable and a value is selected, show an X on the trigger to clear. */
  showClearButton?: boolean;
  children: React.ReactNode;
}) {
  const {
    appliedValue,
    clearable,
    clearLabel,
    clearPending,
    required: contextRequired,
    ariaInvalid: contextAriaInvalid,
  } = useSelectSearchMultiContext();
  const required = requiredProp ?? contextRequired;
  const ariaInvalid =
    ariaInvalidProp === true ||
    ariaInvalidProp === "true" ||
    (ariaInvalidProp == null && contextAriaInvalid);
  const isDisabled = disabled || loading;

  const showClear =
    showClearButton &&
    clearable &&
    appliedValue.length > 0 &&
    !loading &&
    !isDisabled;

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearPending();
  };

  if (asChild) {
    return (
      <PopoverTrigger
        asChild
        disabled={isDisabled}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid || undefined}
        {...props}
      >
        {children}
      </PopoverTrigger>
    );
  }

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid || undefined}
        className={cn(
          "w-full justify-between min-w-0",
          selectSearchMultiTriggerInvalidClasses,
          className,
        )}
        {...props}
      >
        <span className="truncate flex-1 text-left">{children}</span>
        {showClear ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label={clearLabel}
            className="text-muted-foreground hover:text-foreground ml-1 shrink-0 rounded-sm p-0.5"
            onClick={handleClear}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                handleClear(event as unknown as React.MouseEvent);
              }
            }}
          >
            <XClose className="size-3.5" />
          </span>
        ) : null}
        {loading ? (
          <Spinner className="ml-2 size-4 shrink-0" />
        ) : (
          <ChevronSelectorVertical className="ml-2 size-4 shrink-0 opacity-50" />
        )}
      </Button>
    </PopoverTrigger>
  );
}

function SelectSearchMultiContent({
  className,
  popoverWidth = "w-[300px]",
  align = "start",
  side = "bottom",
  ...props
}: React.ComponentProps<typeof PopoverContent> & { popoverWidth?: string }) {
  return (
    <PopoverContent
      className={cn(popoverWidth, "p-0", className)}
      align={align}
      side={side}
      {...props}
    />
  );
}

function SelectSearchMultiInput({
  placeholder,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandInput> & { placeholder?: string }) {
  const { placeholder: contextPlaceholder, setSearchValue } =
    useSelectSearchMultiContext();

  return (
    <CommandInput
      placeholder={placeholder ?? contextPlaceholder}
      onValueChange={(value) => {
        setSearchValue(value);
        onValueChange?.(value);
      }}
      {...props}
    />
  );
}

function SelectSearchMultiOptionsSync() {
  const { open, searchValue, notifyOptionsRegistryChanged } =
    useSelectSearchMultiContext();

  React.useLayoutEffect(() => {
    if (open) {
      notifyOptionsRegistryChanged();
    }
  }, [open, searchValue, notifyOptionsRegistryChanged]);

  return null;
}

function SelectSearchMultiActions({
  showClearItem,
  showSelectAllItem,
}: {
  showClearItem: boolean;
  showSelectAllItem: boolean;
}) {
  const { clearable, selectAll } = useSelectSearchMultiContext();
  const showClear = clearable && showClearItem;
  const showSelectAll = selectAll && showSelectAllItem;

  if (!showClear && !showSelectAll) {
    return null;
  }

  return (
    <SelectSearchMultiGroup forceMount className="border-b">
      {showClear ? <SelectSearchMultiClearItem /> : null}
      {showSelectAll ? <SelectSearchMultiSelectAllItem /> : null}
    </SelectSearchMultiGroup>
  );
}

function SelectSearchMultiList({
  className,
  maxHeight = "h-72",
  children,
  showClearItem = true,
  showSelectAllItem = true,
  ...props
}: React.ComponentProps<typeof ScrollArea> & {
  maxHeight?: string;
  showClearItem?: boolean;
  showSelectAllItem?: boolean;
}) {
  const { searchValue, clearable, selectAll } = useSelectSearchMultiContext();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const viewport = containerRef.current.querySelector(
      "[data-slot='scroll-area-viewport']",
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }, [searchValue]);

  const showActions =
    (clearable && showClearItem) || (selectAll && showSelectAllItem);

  return (
    <CommandList className="max-h-none overflow-hidden">
      {showActions ? (
        <SelectSearchMultiActions
          showClearItem={showClearItem}
          showSelectAllItem={showSelectAllItem}
        />
      ) : null}
      <div ref={containerRef}>
        <ScrollArea className={cn(maxHeight, className)} {...props}>
          {children}
          <SelectSearchMultiOptionsSync />
        </ScrollArea>
      </div>
    </CommandList>
  );
}

function SelectSearchMultiEmpty({
  emptyText,
  ...props
}: React.ComponentProps<typeof CommandEmpty> & { emptyText?: string }) {
  const { emptyText: contextEmptyText } = useSelectSearchMultiContext();
  return (
    <CommandEmpty {...props}>{emptyText ?? contextEmptyText}</CommandEmpty>
  );
}

function SelectSearchMultiGroup({
  children,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup {...props}>{children}</CommandGroup>;
}

interface SelectSearchMultiItemProps extends Omit<
  React.ComponentProps<typeof CommandItem>,
  "value" | "onSelect"
> {
  value: string;
  disabled?: boolean;
  searchText?: string;
  label?: string;
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

function SelectSearchMultiItemIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { selected, variant } = useSelectSearchMultiItem();
  if (!selected) return null;

  return (
    <span
      data-slot="select-search-multi-item-indicator"
      className={cn(
        "absolute right-2 flex size-3.5 items-center justify-center",
        className,
      )}
      {...props}
    >
      <Check
        className={cn(
          "size-4 text-current",
          variant === "destructive" && "text-destructive",
        )}
      />
    </span>
  );
}

function SelectSearchMultiItem({
  value: itemValue,
  disabled,
  searchText,
  label,
  variant = "default",
  children,
  className,
  ...props
}: SelectSearchMultiItemProps) {
  const { appliedValue, commitValue, registerOption, unregisterOption } =
    useSelectSearchMultiContext();
  const selected = appliedValue.includes(itemValue);
  const isDisabled = disabled ?? false;

  const itemSearchText =
    searchText ??
    (typeof children === "string"
      ? children.toLowerCase()
      : (label?.toLowerCase() ?? itemValue.toLowerCase()));

  registerOption(itemValue, {
    searchText: itemSearchText,
    disabled: isDisabled,
  });

  React.useEffect(() => {
    return () => unregisterOption(itemValue);
  }, [itemValue, unregisterOption]);

  const itemContextValue: SelectSearchMultiItemContextValue = {
    value: itemValue,
    selected,
    variant,
  };

  return (
    <SelectSearchMultiItemContext.Provider value={itemContextValue}>
      <CommandItem
        value={itemSearchText}
        data-variant={variant}
        onSelect={() => {
          if (isDisabled) return;
          const next = selected
            ? appliedValue.filter((v) => v !== itemValue)
            : [...appliedValue, itemValue];
          commitValue(next);
        }}
        disabled={isDisabled}
        className={cn(
          "relative min-w-0 pr-8 gap-2 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[selected=true]:bg-destructive/10 dark:data-[variant=destructive]:data-[selected=true]:bg-destructive/20 data-[variant=destructive]:data-[selected=true]:text-destructive data-[variant=destructive]:*:[svg]:text-destructive!",
          className,
        )}
        {...props}
      >
        {children}
        <SelectSearchMultiItemIndicator />
      </CommandItem>
    </SelectSearchMultiItemContext.Provider>
  );
}

function SelectSearchMultiClearItem({
  label,
  className,
  ...props
}: Omit<SelectSearchMultiItemProps, "value" | "children"> & {
  label?: string;
}) {
  const { clearable, clearLabel, appliedValue, clearPending } =
    useSelectSearchMultiContext();
  if (!clearable) return null;

  const text = label ?? clearLabel;
  const selected = appliedValue.length === 0;

  const itemContextValue: SelectSearchMultiItemContextValue = {
    value: "__clear__",
    selected,
    variant: "destructive",
  };

  return (
    <SelectSearchMultiItemContext.Provider value={itemContextValue}>
      <CommandItem
        forceMount
        value={`${text.toLowerCase()} clear reset`}
        data-variant="destructive"
        onSelect={() => {
          clearPending();
        }}
        className={cn(
          "relative pr-8 gap-2 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[selected=true]:bg-destructive/10 dark:data-[variant=destructive]:data-[selected=true]:bg-destructive/20 data-[variant=destructive]:data-[selected=true]:text-destructive data-[variant=destructive]:*:[svg]:text-destructive!",
          className,
        )}
        {...props}
      >
        {text}
        <SelectSearchMultiItemIndicator />
      </CommandItem>
    </SelectSearchMultiItemContext.Provider>
  );
}

function SelectSearchMultiSelectAllItem({
  label,
  className,
  ...props
}: Omit<SelectSearchMultiItemProps, "value" | "children"> & {
  label?: string;
}) {
  const {
    selectAll,
    selectAllLabel,
    appliedValue,
    getMatchingOptionValues,
    runSelectAll,
    selectAllPending,
    hasAsyncSelectAll,
  } = useSelectSearchMultiContext();

  if (!selectAll) return null;

  const text = label ?? selectAllLabel;
  const matching = hasAsyncSelectAll ? [] : getMatchingOptionValues();
  const allSelected =
    !hasAsyncSelectAll &&
    matching.length > 0 &&
    matching.every((v) => appliedValue.includes(v));
  const isDisabled =
    selectAllPending || (!hasAsyncSelectAll && matching.length === 0);

  const itemContextValue: SelectSearchMultiItemContextValue = {
    value: "__select_all__",
    selected: allSelected,
    variant: "default",
  };

  return (
    <SelectSearchMultiItemContext.Provider value={itemContextValue}>
      <CommandItem
        forceMount
        value={`${text.toLowerCase()} select all`}
        disabled={isDisabled}
        onSelect={() => {
          if (isDisabled || allSelected) return;
          runSelectAll();
        }}
        className={cn(
          "relative pr-8 gap-2",
          isDisabled && "opacity-50",
          className,
        )}
        {...props}
      >
        {text}
        {selectAllPending ? (
          <Spinner className="absolute right-2 size-3.5" />
        ) : (
          <SelectSearchMultiItemIndicator />
        )}
      </CommandItem>
    </SelectSearchMultiItemContext.Provider>
  );
}

function SelectSearchMultiCommand({
  className,
  children,
  filter,
  ...props
}: React.ComponentProps<typeof Command> & {
  filter?: (value: string, search: string) => number;
}) {
  const filterFn = filter ?? selectSearchMultiCommandFilter;
  return (
    <Command className={className} filter={filterFn} {...props}>
      {children}
    </Command>
  );
}

function useSelectSearchMultiItem() {
  const context = React.useContext(SelectSearchMultiItemContext);
  if (!context) {
    throw new Error(
      "useSelectSearchMultiItem must be used within SelectSearchMultiItem",
    );
  }
  return context;
}

export {
  SelectSearchMulti,
  SelectSearchMultiTrigger,
  SelectSearchMultiValue,
  SelectSearchMultiContent,
  SelectSearchMultiInput,
  SelectSearchMultiList,
  SelectSearchMultiEmpty,
  SelectSearchMultiGroup,
  SelectSearchMultiItem,
  SelectSearchMultiClearItem,
  SelectSearchMultiSelectAllItem,
  SelectSearchMultiItemIndicator,
  SelectSearchMultiCommand,
  useSelectSearchMultiItem,
};

export type { SelectSearchMultiItemProps };
