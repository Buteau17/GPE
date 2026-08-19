import { useCallback, useRef, useState, type DragEvent } from "react";

export type UploadPanelProps = {
  onFile: (file: File) => void;
  disabled: boolean;
};

export function UploadPanel({ onFile, disabled }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`upload-panel${isDragging ? " dragging" : ""}${disabled ? " disabled" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
      <p className="upload-title">Drop a photo here, or click to choose one</p>
      <p className="upload-hint">JPG or PNG · processed entirely in your browser, nothing is uploaded to a server</p>
    </div>
  );
}
