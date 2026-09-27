"use client";
import Link from "next/link";
import { Heart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { img, type Product } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num, price } from "@/lib/format";
import { Ring } from "./ui";

export default function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { t, locale } = useI18n();
  const [fav, setFav] = useState(false);
  const fa = locale === "fa";
  return (
    <Link href={`/product/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl glass ring-glow transition-all duration-500 hover:-translate-y-1.5"
      style={{ animation: `none`, transitionDelay: `${(i % 6) * 20}ms` }}>
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={img(p)} alt={fa ? p.title_fa : p.title_en} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {p.match !== undefined && (
          <div className="absolute top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md"
            style={{ insetInlineStart: 12 }}>
            <Ring value={p.match} size={18} /> {num(p.match.toFixed(0), locale)}٪ {t("match")}
          </div>
        )}
        {p.discount > 0 && (
          <span className="absolute top-3 rounded-full bg-[var(--color-flare)] px-2 py-1 text-[11px] font-black text-white"
            style={{ insetInlineEnd: 12 }}>
            {num(p.discount, locale)}٪ {t("off")}
          </span>
        )}
        <button aria-label={t("fav")}
          onClick={(e) => { e.preventDefault(); setFav((v) => !v); }}
          className="absolute bottom-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:scale-110"
          style={{ insetInlineEnd: 12 }}>
          <Heart size={16} fill={fav ? "#ff3d8b" : "none"} color={fav ? "#ff3d8b" : "currentColor"} />
        </button>
        <span className="absolute bottom-3 rounded-full px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md"
          style={{ insetInlineStart: 12, background: p.hex + "cc" }}>
          {fa ? p.color_fa : p.color_en}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-bold">{fa ? p.title_fa : p.title_en}</h3>
        <div className="flex items-center gap-2 text-[11px] muted">
          <span>{fa ? p.shop_fa : p.shop_en}</span>
          <span className="inline-flex items-center gap-0.5"><Star size={11} className="fill-[var(--color-amberish)] text-[var(--color-amberish)]" />{num(p.rating, locale)}</span>
          <span className="inline-flex items-center gap-1"><Truck size={11} />{num(p.delivery_days, locale)} {t("days")}</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-extrabold">{price(p.final_price, locale)}</span>
          <span className="text-[10px] muted">{t("toman")}</span>
          {p.discount > 0 && (
            <span className="text-[11px] muted line-through">{price(p.price, locale)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return <div className="skeleton h-[380px] rounded-3xl" />;
}
