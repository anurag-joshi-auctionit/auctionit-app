

import * as React from "react";
import { useState } from "react";
import { useFileUpload, type FileWithPreview } from "../../hooks/use-file-upload";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./dialog";
import { UploadCloud01, Eye, Trash03 } from "@untitledui/icons";
import { cn } from "../../lib/utils";

interface AvatarUploadProps extends React.ComponentProps<"div"> {
  maxSize?: number;
  onFileChange?: (file: FileWithPreview | null) => void;
  defaultAvatar?: string;
}

function AvatarUpload({
  maxSize = 2 * 1024 * 1024,
  className,
  onFileChange,
  defaultAvatar,
  ...props
}: AvatarUploadProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [
    { files, isDragging, errors },
    { removeFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps, inputRef },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: false,
    onFilesChange: (files) => {
      onFileChange?.(files[0] || null);
    },
  });

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || defaultAvatar;

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  return (
    <div
      data-slot="avatar-upload"
      className={cn("flex items-start gap-4", className)}
      {...props}
    >
      <div className="relative">
        <div
          className={cn(
            "group/avatar relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-dashed transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/20",
            previewUrl && "border-solid",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps()} ref={inputRef} className="sr-only" />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UploadCloud01 className="size-6 text-muted-foreground" />
            </div>
          )}

          {currentFile && (
            <div
              className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover/avatar:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPreviewOpen(true);
                    }}
                    className="size-6 cursor-pointer"
                    aria-label="Preview avatar"
                  >
                    <Eye className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <div className="flex items-center justify-center p-4">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Avatar preview"
                        className="max-h-[70vh] max-w-full rounded-lg object-contain"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleRemove();
                }}
                className="size-6 cursor-pointer"
                aria-label="Remove avatar"
              >
                <Trash03 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          className="w-fit"
        >
          Upload
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG, JPG or WebP (max. 800x400px)
        </p>
      </div>

      {errors.length > 0 && (
        <div className="text-xs text-destructive">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export { AvatarUpload };
