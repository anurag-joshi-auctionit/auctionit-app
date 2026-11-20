import { Checkbox, DatePicker, Input, Textarea } from "@auctionit/ui";
import { RadioGroup, RadioGroupItem } from "@auctionit/ui/components/ui/radio-group";
import type { RaStageQuestion } from "@/lib/ra-stages/types";

const ACCEPT_BY_FILE_TYPE: Record<string, string> = {
  pdf: ".pdf",
  word: ".doc,.docx",
  excel_csv: ".xls,.xlsx,.csv",
  images: ".jpg,.jpeg,.png,.webp",
  video: ".mp4,.mov,.avi",
  zip: ".zip",
  text: ".txt",
};

function fileAccept(allowedFileTypes: string[]): string | undefined {
  if (allowedFileTypes.length === 0) return undefined;
  return allowedFileTypes.map((t) => ACCEPT_BY_FILE_TYPE[t] ?? "").filter(Boolean).join(",");
}

type Props = {
  question: RaStageQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

export function QuestionAnswerField({
  question,
  value,
  onChange,
  file,
  onFileChange,
  disabled,
}: Props) {
  switch (question.answerType) {
    case "short_text":
      return (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
        />
      );

    case "long_text":
      return (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
        />
      );

    case "date":
      return (
        <DatePicker
          value={(value as string) ?? ""}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "single_choice":
      return (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={onChange}
          disabled={disabled}
        >
          {question.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={opt.value} />
              {opt.value}
            </label>
          ))}
        </RadioGroup>
      );

    case "multiple_choice": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(next) => {
                    const nextSelected = next
                      ? [...selected, opt.value]
                      : selected.filter((v) => v !== opt.value);
                    onChange(nextSelected);
                  }}
                />
                {opt.value}
              </label>
            );
          })}
        </div>
      );
    }

    case "file_upload":
      return (
        <div className="space-y-1">
          <input
            type="file"
            disabled={disabled}
            accept={fileAccept(question.fileUpload.allowedFileTypes)}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          {file ? <p className="text-muted-foreground text-xs">{file.name}</p> : null}
        </div>
      );

    default:
      return null;
  }
}
