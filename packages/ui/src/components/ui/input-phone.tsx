
import * as React from "react";
import { ChevronDown } from "@untitledui/icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./input-group";
import { Button } from "./button";
import {
  SelectSearch,
  SelectSearchTrigger,
  SelectSearchContent,
  SelectSearchInput,
  SelectSearchList,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchItem,
  SelectSearchCommand,
} from "./select-search";
import { useCountriesQuery } from "../../hooks/use-countries-stub";

type CountriesMap = Record<string, { name: string; dial_code: string }>;

/** Minimal offline fallback so the control works before masters load. */
const fallbackCountriesMap: CountriesMap = {
  IN: { name: "India", dial_code: "+91" },
};

const fallbackCountriesArray = Object.entries(fallbackCountriesMap).map(
  ([code, data]) => ({
    code,
    name: data.name,
    dial_code: data.dial_code,
    searchText: data.name.toLowerCase(),
  }),
);

const fallbackDialCodeMap = new Map(
  fallbackCountriesArray.map((country) => [country.dial_code, country]),
);

const DIGIT_KEY = /^[0-9]$/;

const KEYBOARD_NAV_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

function isAllowedPhoneKey(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.nativeEvent.isComposing) return true;
  if (KEYBOARD_NAV_KEYS.has(event.key)) return true;
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  return DIGIT_KEY.test(event.key);
}

function CountryCodeItem({
  name,
  dialCode,
}: {
  name: string;
  dialCode: string;
}) {
  return (
    <div className="flex-1 text-sm flex items-center gap-2">
      <span>{name}</span>
      <span className="text-muted-foreground text-xs">({dialCode})</span>
    </div>
  );
}

export interface InputPhoneProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  countries?: CountriesMap;
  defaultCountryCode?: string;
  /** When true, country code is fixed to +91 and cannot be changed. */
  lockCountryCode?: boolean;
  onCountryCodeChange?: (code: string) => void;
  placeholder?: string;
}

/**
 * Phone input with optional locked +91 prefix.
 * Values are normalized to digits only; locked +91 defaults maxLength to 10.
 */
const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  (
    {
      countries: countriesProp,
      defaultCountryCode = "IN",
      lockCountryCode = false,
      onCountryCodeChange,
      placeholder = "Phone number",
      className,
      maxLength: maxLengthProp,
      onKeyDown,
      onChange,
      ...props
    },
    ref,
  ) => {
    const { data: countryRows = [] } = useCountriesQuery(false);

    const countries = React.useMemo<CountriesMap>(() => {
      if (countriesProp) return countriesProp;
      const o: CountriesMap = {};
      for (const r of countryRows) {
        if (r.dialCode) {
          o[r.key] = { name: r.name, dial_code: r.dialCode };
        }
      }
      return Object.keys(o).length > 0 ? o : fallbackCountriesMap;
    }, [countriesProp, countryRows]);

    const [selectedCode, setSelectedCode] = React.useState(() => {
      const country = countries[defaultCountryCode];
      return country?.dial_code ?? "+91";
    });

    const countriesArray = React.useMemo(() => {
      if (countries === fallbackCountriesMap) {
        return fallbackCountriesArray;
      }
      return Object.entries(countries).map(([code, data]) => ({
        code,
        name: data.name,
        dial_code: data.dial_code,
        searchText: `${data.name} ${data.dial_code}`.toLowerCase(),
      }));
    }, [countries]);

    const dialCodeMap = React.useMemo(() => {
      if (countries === fallbackCountriesMap) {
        return fallbackDialCodeMap;
      }
      return new Map(
        countriesArray.map((country) => [country.dial_code, country]),
      );
    }, [countries, countriesArray]);

    const selectedCountry = dialCodeMap.get(selectedCode);

    const selectOptions = React.useMemo(
      () =>
        countriesArray.map((country) => ({
          key: country.code,
          value: country.dial_code,
          label: country.name,
          searchText: `${country.name} ${country.dial_code} ${country.code}`.toLowerCase(),
          name: country.name,
          dial_code: country.dial_code,
        })),
      [countriesArray],
    );

    const handleCodeChange = React.useCallback(
      (dialCode: string) => {
        setSelectedCode(dialCode);
        onCountryCodeChange?.(dialCode);
      },
      [onCountryCodeChange],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isAllowedPhoneKey(event)) {
          event.preventDefault();
        }
        onKeyDown?.(event);
      },
      [onKeyDown],
    );

    const effectiveMaxLength =
      maxLengthProp ?? (lockCountryCode ? 10 : undefined);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let digits = event.target.value.replace(/\D/g, "");
        if (effectiveMaxLength != null) {
          digits = digits.slice(0, effectiveMaxLength);
        }
        if (digits === event.target.value) {
          onChange?.(event);
          return;
        }
        const nextEvent = {
          ...event,
          target: { ...event.target, value: digits },
          currentTarget: { ...event.currentTarget, value: digits },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(nextEvent);
      },
      [effectiveMaxLength, onChange],
    );

    return (
      <InputGroup className={className}>
        <InputGroupAddon align="inline-start">
          {lockCountryCode ? (
            <span className="px-2 text-sm font-medium">+91</span>
          ) : (
            <SelectSearch value={selectedCode} onValueChange={handleCodeChange}>
              <SelectSearchTrigger asChild variant="ghost">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-full min-w-fit gap-1 border-0 p-1 shadow-none focus:ring-0 data-[state=open]:bg-transparent"
                >
                  <span className="text-sm font-medium">
                    {selectedCountry?.dial_code || selectedCode}
                  </span>
                  <ChevronDown className="size-4 opacity-50" />
                </Button>
              </SelectSearchTrigger>
              <SelectSearchContent popoverWidth="w-[300px]" align="start">
                <SelectSearchCommand>
                  <SelectSearchInput placeholder="Search..." />
                  <SelectSearchList maxHeight="h-72">
                    <SelectSearchEmpty emptyText="No country found." />
                    <SelectSearchGroup>
                      {selectOptions.map((option) => (
                        <SelectSearchItem
                          key={option.key ?? option.value}
                          value={option.value}
                          searchText={option.searchText}
                          label={option.label}
                        >
                          <CountryCodeItem
                            name={option.name}
                            dialCode={option.dial_code}
                          />
                        </SelectSearchItem>
                      ))}
                    </SelectSearchGroup>
                  </SelectSearchList>
                </SelectSearchCommand>
              </SelectSearchContent>
            </SelectSearch>
          )}
        </InputGroupAddon>
        <InputGroupInput
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel"
          placeholder={placeholder}
          maxLength={effectiveMaxLength}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
      </InputGroup>
    );
  },
);

InputPhone.displayName = "InputPhone";

export { InputPhone };
