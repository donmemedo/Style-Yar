"use client";
import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, ScanLine } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function UploadZone({ onFile, busy, preview }:
  { onFile: (f: File) => void; busy?: boolean; preview?: string | null }) {
  const { t } = useI18n();
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const drop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("image/")) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      onClick={() => ref.current?.click()}
      role="button" tabIndex={0}
      className={`relative grid cursor-pointer place-items-center overflow-hidden rounded-[2rem] border-2 border-dashed
        p-8 text-center transition-all duration-500 ring-glow glass
        ${over ? "scale-[1.02] border-[var(--color-neon)]" : "border-[var(--line)] hover:border-[var(--color-brand-300)]"}`}
      style={{ minHeight: 300 }}>
      <input ref={ref} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

      {preview && (
        <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      )}
      {busy && (
        <div className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[var(--color-neon)]/35 to-transparent scanline" />
      )}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <span className="relative grid h-16 w-16 place-items-center rounded-3xl grad-bg text-white shadow-2xl shadow-[var(--glow)]">
          {busy ? <Loader2 className="animate-spin" size={26} /> : preview ? <ScanLine size={26} /> : <ImagePlus size={26} />}
          {!busy && <span className="pulse-ring absolute inset-0 rounded-3xl border-2 border-[var(--color-brand-300)]" />}
        </span>
        <p className="text-lg font-extrabold">{busy ? t("scanning") : t("drop_title")}</p>
        {!busy && <p className="max-w-sm text-xs muted">{t("drop_sub")}</p>}
      </div>
    </div>
  );
}
