

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  UploadSuccessMessages,
  UploadValidationMessages,
} from "../lib/upload/messages";

export interface FileWithPreview extends File {
  id: string;
  preview: string;
}

/**
 * Formats bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2 MB", "500 KB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: FileWithPreview[]) => void;
}

interface UseFileUploadReturn {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
  removeFile: (id: string) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  openFileDialog: () => void;
  getInputProps: () => Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref">;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useFileUpload({
  maxFiles = 1,
  maxSize = 2 * 1024 * 1024,
  accept = "image/*",
  multiple = false,
  onFilesChange,
}: UseFileUploadOptions = {}): [UseFileUploadReturn, UseFileUploadReturn] {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `File size exceeds ${formatBytes(maxSize)}`;
      }

      if (accept && accept !== "*/*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileType = file.type;
        const isValidType = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return fileType.startsWith(baseType + "/");
          }
          return fileType === type;
        });

        if (!isValidType) {
          return `File type not supported. Accepted types: ${accept}`;
        }
      }

      return null;
    },
    [maxSize, accept],
  );

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const newFiles: FileWithPreview[] = [];
      const newErrors: string[] = [];

      const fileArray = Array.from(fileList);

      const totalFiles = files.length + fileArray.length;
      if (totalFiles > maxFiles) {
        toast.error(UploadValidationMessages.MAX_FILES_ALLOWED(maxFiles));
        return;
      }

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
          toast.error(error);
        } else {
          const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const preview = URL.createObjectURL(file);
          const fileWithPreview = Object.assign(file, { id, preview });
          newFiles.push(fileWithPreview);
        }
      });

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
        toast.success(
          UploadSuccessMessages.FILES_UPLOADED_SUCCESSFULLY(newFiles.length),
        );
      }
    },
    [files, maxFiles, validateFile, onFilesChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prevFiles) => {
        const fileToRemove = prevFiles.find((f) => f.id === id);
        if (fileToRemove?.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        const updatedFiles = prevFiles.filter((f) => f.id !== id);
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
      setErrors((prev) => prev.filter((_, index) => index < files.length));
    },
    [files.length, onFilesChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const getInputProps = useCallback((): Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "ref"
  > => {
    return {
      type: "file",
      accept,
      multiple,
      onChange: handleFileChange,
      style: { display: "none" },
    };
  }, [accept, multiple, handleFileChange]);

  const returnValue: UseFileUploadReturn = {
    files,
    isDragging,
    errors,
    removeFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    openFileDialog,
    getInputProps,
    inputRef,
  };

  return [returnValue, returnValue];
}
