import { useAuth } from "@auctionit/lib";
import {
  InputTags,
  InputTagsCommand,
  InputTagsContent,
  InputTagsEmpty,
  InputTagsList,
  InputTagsTrigger,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type MaterialOption = {
  id: number;
  label: string;
  breadcrumbLabel: string;
};

type SignupMaterialsSelectProps = {
  value: number[];
  onChange: (next: number[]) => void;
  required?: boolean;
  disabled?: boolean;
};

export function SignupMaterialsSelect({
  value,
  onChange,
  required,
  disabled,
}: SignupMaterialsSelectProps) {
  const { api } = useAuth();

  const materialsQuery = useQuery({
    queryKey: ["signup", "materials"],
    queryFn: () =>
      api.get<{ items: MaterialOption[] }>("/auth/signup/materials"),
  });

  const options = useMemo(
    () =>
      (materialsQuery.data?.items ?? []).map((m) => ({
        value: String(m.id),
        label: m.label,
        description: m.breadcrumbLabel ?? m.label,
      })),
    [materialsQuery.data?.items],
  );

  const stringValue = useMemo(() => value.map(String), [value]);

  return (
    <InputTags
      value={stringValue}
      onValueChange={(next) =>
        onChange(next.map(Number).filter((n) => Number.isInteger(n)))
      }
      options={options}
      placeholder="Add materials…"
      emptyText={
        materialsQuery.isLoading ? "Loading materials…" : "No materials found."
      }
      disabled={disabled}
      readOnly
      required={required}
    >
      <InputTagsTrigger required={required} />
      <InputTagsContent className="w-[min(100vw-2rem,28rem)]">
        <InputTagsCommand>
          <InputTagsList className="max-h-72">
            <InputTagsEmpty />
          </InputTagsList>
        </InputTagsCommand>
      </InputTagsContent>
    </InputTags>
  );
}
