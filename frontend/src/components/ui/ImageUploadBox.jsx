import { useRef, useState } from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { cn } from "../../utils/cn.js";

export default function ImageUploadBox({
  value = null,
  onChange,
  label = "Product image",
  hint = "PNG or JPG, up to 2MB",
  className,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-muted">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {value ? (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img
            src={value}
            alt={label}
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-danger/90 text-white transition-colors hover:bg-danger"
              aria-label="Remove image"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors duration-200",
            dragging
              ? "border-primary bg-primary/10"
              : "border-white/15 bg-white/[0.03] hover:border-primary/50 hover:bg-white/[0.05]"
          )}
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FiUploadCloud size={20} />
          </span>
          <span className="text-sm font-medium text-white">
            Click to upload or drag & drop
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <FiImage size={12} /> {hint}
          </span>
        </button>
      )}
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
