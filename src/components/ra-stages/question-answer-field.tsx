import { Checkbox, DatePicker, Input, Textarea } from "@auctionit/ui";
import { RadioGroup, RadioGroupItem } from "@auctionit/ui/components/ui/radio-group";
import type { RaStageQuestion } from "@/lib/ra-stages/types";

const FILE_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  word: "Word",
  excel_csv: "Excel / CSV",
  images: "Images",
  video: "Video",
  zip: "ZIP",
  text: "Text",
};

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

function fileHelpText(question: RaStageQuestion): string | null {
  if (question.answerType !== "file_upload") return null;
  const { allowedFileTypes, maxFileSizeMb } = question.fileUpload;
  const parts: string[] = [];
  if (allowedFileTypes.length > 0) {
    const labels = allowedFileTypes.map((t) => FILE_TYPE_LABEL[t] ?? t);
    parts.push(`Accepted: ${labels.join(", ")}`);
  }
  if (maxFileSizeMb) parts.push(`Max ${maxFileSizeMb} MB`);
  return parts.length > 0 ? parts.join(" · ") : null;
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
        <div className="max-w-xs">
          <DatePicker
            value={(value as string) ?? ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
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

    case "file_upload": {
      const helpText = fileHelpText(question);
      return (
        <div className="space-y-1.5">
          <Input
            type="file"
            disabled={disabled}
            accept={fileAccept(question.fileUpload.allowedFileTypes)}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          {helpText ? (
            <p className="text-muted-foreground text-xs">{helpText}</p>
          ) : null}
        </div>
      );
    }

    default:
      return null;
  }
}
