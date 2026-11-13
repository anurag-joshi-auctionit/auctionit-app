import { Badge } from "./badge";

/**
 * Option label with a trailing #id badge in normal text flow.
 * Name wraps like regular prose; the badge stays whole (nowrap) and only
 * moves to the next line when it no longer fits — like another word.
 */
export function EntityIdOptionLabel({
  label,
  id,
}: {
  label: string;
  id: string | number;
}) {
  return (
    <span className="min-w-0 w-full">
      <span className="mr-2">{label}</span>
      <Badge color="grey">
        <span className="font-bold">#{id}</span>
      </Badge>
    </span>
  );
}
