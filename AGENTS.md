## Validation / user-facing copy

- **Never hardcode validation or toast/error strings** in forms, Zod schemas, API services, or UI.
- Put copy in `packages/messages/src/<domain>/messages.ts` (e.g. `AuctionsValidationMessages`) and import the constant.
- Prefer reusing an existing key; add a new key when the wording or semantics differ.
- Apply the same rule on admin form rules, API write/import schemas, and bulk-upload parsers.
- **Button / menu labels and dialog titles/descriptions** (e.g. "Save", "Cancel", "Download Template", "Bulk Import") stay inline in components — do not put them in messages.
