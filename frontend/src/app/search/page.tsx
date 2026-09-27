"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Palette, SlidersHorizontal, Wand2, X } from "lucide-react";
import Link from "next/link";
import { get, post, searchImage, type Product, type SearchResult } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num } from "@/lib/format";
import ProductCard, { CardSkeleton } from "@/components/ProductCard";
import UploadZone from "@/components/UploadZone";
import { Btn, Pill, Reveal } from "@/components/ui";

type Meta = { categories: { key: string; fa: string; en: string }[]; colors: { key: string; fa: string; en: string; hex: string }[] };

function SearchInner() {
  const { t, locale } = useI18n();
  const fa = locale === "fa";
  const params = useSearchParams();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [items, setItems] = useState<Product[] | null>(null);
  const [res, setRes] = useState<SearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cat, setCat] = useState<string>("");
  const [color, setColor] = useState<string>(params.get("color") || "");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState(params.get("q") || "");
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => { get<Meta>("/meta").then(setMeta).catch(() => {}); }, []);

  const browse = useCallback(async () => {
    setItems(null);
    const qs = new URLSearchParams({ sort, limit: "36" });
    if (cat) qs.set("category", cat);
    if (color) qs.set("color", color);
    if (q) qs.set("q", q);
    try {
      const d = await get<{ items: Product[] }>(`/products?${qs}`);
      setItems(d.items);
    } catch { setItems([]); }
  }, [cat, color, sort, q]);

  useEffect(() => { if (!res) browse(); }, [browse, res]);

  const onFile = async (f: File) => {
    setPreview(URL.createObjectURL(f));
    setBusy(true); setItems(null);
    try {
      const d = await searchImage(f, cat || undefined);
      setRes(d); setItems(d.items);
    } catch { setItems([]); }
    setBusy(false);
  };

  const byColor = async (hex: string, key: string) => {
    setColor(key); setPreview(null); setBusy(true); setItems(null);
    try {
      const d = await post<SearchResult>("/search/color", { hex, category: cat || null });
      setRes(d); setItems(d.items);
    } catch { setItems([]); }
    setBusy(false);
  };

  const reset = () => { setRes(null); setPreview(null); setColor(""); setCat(""); setQ(""); };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Reveal>
            <h1 className="mb-4 text-3xl font-black sm:text-4xl">{t("nav_search")}</h1>
            <UploadZone onFile={onFile} busy={busy} preview={preview} />
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-3xl glass p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold muted">
                <Palette size={14} />{t("or_color")}
              </p>
              <div className="flex flex-wrap gap-2">
                {meta?.colors.map((c) => (
                  <button key={c.key} onClick={() => byColor(c.hex, c.key)}
                    title={fa ? c.fa : c.en} aria-label={fa ? c.fa : c.en}
                    className={`h-8 w-8 rounded-full border-2 transition hover:scale-125
                      ${color === c.key ? "border-[var(--color-neon)] scale-125" : "border-[var(--line)]"}`}
                    style={{ background: c.hex }} />
                ))}
              </div>
            </div>
          </Reveal>

          {res && (
            <Reveal>
              <div className="rounded-3xl glass p-4 text-xs">
                <div className="mb-2 flex items-center justify-between font-bold">
                  <span>{t("palette")}</span>
                  <span className="muted">{t("took")}: {num(res.took_ms, locale)}ms</span>
                </div>
                <div className="flex gap-2">
                  {res.palette.map((h) => (
                    <span key={h} className="h-8 flex-1 rounded-lg" style={{ background: h }} title={h} />
                  ))}
                </div>
                {res.needs_stylist && (
                  <Link href="/stylist" className="mt-3 flex items-center gap-2 rounded-2xl border border-[var(--color-flare)] p-3 font-bold text-[var(--color-flare)]">
                    <Wand2 size={14} />{t("low_conf")}
                  </Link>
                )}
              </div>
            </Reveal>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => { setQ(e.target.value); setRes(null); }}
              placeholder={t("search_ph")}
              className="glass min-w-40 flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-300)]" />
            <button onClick={() => setOpenFilters((v) => !v)}
              className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold">
              <SlidersHorizontal size={15} />{t("filters")}
            </button>
            {(res || color || cat || q) && (
              <button onClick={reset} aria-label={t("back")} className="glass grid h-10 w-10 place-items-center rounded-2xl"><X size={15} /></button>
            )}
          </div>

          {openFilters && (
            <div className="mb-4 space-y-3 rounded-3xl glass p-4">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                <Pill active={!cat} onClick={() => { setCat(""); setRes(null); }}>{t("all")}</Pill>
                {meta?.categories.map((c) => (
                  <Pill key={c.key} active={cat === c.key} onClick={() => { setCat(c.key); setRes(null); }}>
                    {fa ? c.fa : c.en}
                  </Pill>
                ))}
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {(["popular", "cheap", "expensive", "rating", "discount"] as const).map((s) => (
                  <Pill key={s} active={sort === s} onClick={() => { setSort(s); setRes(null); }}>
                    {t(`sort_${s}` as const)}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <p className="mb-4 text-sm muted">
            {items ? `${num(items.length, locale)} ${t("results")}` : "…"}
            {res && res.confidence < 100 ? ` · ${t("match")} ${num(res.confidence.toFixed(0), locale)}٪` : ""}
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items?.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
            {!items && Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          {items?.length === 0 && (
            <div className="rounded-3xl glass p-10 text-center">
              <p className="font-bold">{t("empty")}</p>
              <Link href="/stylist" className="mt-4 inline-block"><Btn variant="ghost">{t("nav_stylist")}</Btn></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="p-20 text-center">…</div>}><SearchInner /></Suspense>;
}
