"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Heart, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { get, img, type Product } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num, price } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import { Btn, Pill, Reveal } from "@/components/ui";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale, dir } = useI18n();
  const fa = locale === "fa";
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const [data, setData] = useState<{ product: Product; similar: Product[] } | null>(null);
  const [size, setSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => { get<typeof data>(`/products/${id}`).then(setData).catch(() => {}); }, [id]);

  if (!data) return <div className="mx-auto max-w-7xl p-6"><div className="skeleton h-[70vh] rounded-[2rem]" /></div>;
  const p = data.product;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
      <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-bold muted hover:ink">
        <Back size={16} />{t("back")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] ring-glow">
            <img src={img(p)} alt={fa ? p.title_fa : p.title_en} className="w-full object-cover" />
          </div>
        </Reveal>

        <Reveal delay={80} className="flex flex-col gap-5">
          <div>
            <span className="glass inline-flex rounded-full px-3 py-1 text-[11px] font-bold">
              {fa ? p.category_fa : p.category_en} · {fa ? p.style_fa : p.style_en}
            </span>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{fa ? p.title_fa : p.title_en}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs muted">
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="fill-[var(--color-amberish)] text-[var(--color-amberish)]" />
                {num(p.rating, locale)} · {num(p.reviews, locale)} {t("reviews")}
              </span>
              <span className="inline-flex items-center gap-1"><Truck size={13} />{t("delivery")} {num(p.delivery_days, locale)} {t("days")}</span>
              <span className={`inline-flex items-center gap-1 font-bold ${p.stock ? "text-[var(--color-neon)]" : "text-[var(--color-flare)]"}`}>
                <ShieldCheck size={13} />{p.stock ? `${t("instock")} (${num(p.stock, locale)})` : t("outstock")}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3 rounded-3xl glass p-5">
            <span className="text-3xl font-black grad-text">{price(p.final_price, locale)}</span>
            <span className="text-xs muted">{t("toman")}</span>
            {p.discount > 0 && (
              <span className="ms-auto rounded-full bg-[var(--color-flare)] px-3 py-1 text-xs font-black text-white">
                {num(p.discount, locale)}٪ {t("off")}
              </span>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-bold muted">{t("sizes")}</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <Pill key={s} active={size === s} onClick={() => setSize(s)}>{num(s, locale)}</Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Btn onClick={() => setAdded(true)} disabled={!p.stock} className="flex-1">
              {added ? <><Check size={17} />{t("added")}</> : <><ShoppingBag size={17} />{t("add")}</>}
            </Btn>
            <Btn variant="ghost" onClick={() => setFav((v) => !v)} aria-label={t("fav")}>
              <Heart size={17} fill={fav ? "#ff3d8b" : "none"} color={fav ? "#ff3d8b" : "currentColor"} />
            </Btn>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[[t("shop"), fa ? p.shop_fa : p.shop_en], [t("color"), fa ? p.color_fa : p.color_en],
              ["Pattern", fa ? p.pattern_fa : p.pattern_en], [t("rating"), num(p.shop_rating, locale)]].map(([k, v]) => (
              <div key={String(k)} className="rounded-2xl glass p-3">
                <div className="muted">{k}</div>
                <div className="mt-0.5 font-bold">{v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-black">{t("similar")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.similar.map((s, i) => <ProductCard key={s.id} p={s} i={i} />)}
        </div>
      </section>
    </div>
  );
}
