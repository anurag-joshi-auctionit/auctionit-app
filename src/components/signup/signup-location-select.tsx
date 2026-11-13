import { useAuth } from "@auctionit/lib";
import {
  FormControl,
  FormLabel,
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchTrigger,
  SelectSearchValue,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type SignupLocationValue = {
  locationId: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

type LocationSearchItem = {
  id: number;
  city: string;
  state: string;
  country: string;
};

function formatLocationPath(
  city: string | null,
  state: string | null,
  country: string | null,
): string {
  return [city, state, country].filter(Boolean).join(", ");
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type SignupLocationSelectProps = {
  value: SignupLocationValue;
  onChange: (value: SignupLocationValue) => void;
  required?: boolean;
  disabled?: boolean;
};

export function SignupLocationSelect({
  value,
  onChange,
  required,
  disabled,
}: SignupLocationSelectProps) {
  const { api } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const locationsQuery = useQuery({
    queryKey: ["signup", "locations", debouncedSearch],
    queryFn: () =>
      api.get<{ items: LocationSearchItem[] }>(
        `/auth/signup/locations/search?q=${encodeURIComponent(debouncedSearch)}`,
      ),
    enabled: debouncedSearch.trim().length > 0,
  });

  const items = locationsQuery.data?.items ?? [];
  const selectedLabel = formatLocationPath(
    value.city,
    value.state,
    value.country,
  );

  return (
    <>
      <FormLabel required={required}>Location</FormLabel>
      <SelectSearch
        value={value.locationId ? String(value.locationId) : ""}
        onValueChange={(next) => {
          const match = items.find((item) => String(item.id) === next);
          if (!match) return;
          onChange({
            locationId: match.id,
            city: match.city,
            state: match.state,
            country: match.country,
          });
        }}
        required={required}
      >
        <FormControl>
          <SelectSearchTrigger disabled={disabled} required={required}>
            <SelectSearchValue placeholder="Search city, state, or country">
              {selectedLabel || undefined}
            </SelectSearchValue>
          </SelectSearchTrigger>
        </FormControl>
        <SelectSearchContent>
          <SelectSearchCommand shouldFilter={false}>
            <SelectSearchInput
              placeholder="Search city, state, or country"
              value={search}
              onValueChange={setSearch}
            />
            <SelectSearchList>
              <SelectSearchEmpty
                emptyText={
                  debouncedSearch.trim().length === 0
                    ? "Type to search locations…"
                    : locationsQuery.isFetching
                      ? "Searching…"
                      : "No locations found."
                }
              />
              <SelectSearchGroup>
                {items.map((item) => (
                  <SelectSearchItem key={item.id} value={String(item.id)}>
                    {formatLocationPath(item.city, item.state, item.country)}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>
    </>
  );
}
