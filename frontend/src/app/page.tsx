"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Cpu, ShoppingBag, Sparkles, Store, Wand2 } from "lucide-react";
import { get, img, type Product } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num } from "@/lib/format";
import ProductCard, { CardSkeleton } from "@/components/ProductCard";
import { Btn, Reveal } from "@/components/ui";

type Collection = { id: string; colors: string[]; title_fa: string; title_en: string; sub_fa: string; sub_en: string; tint: string; count: number; items: Product[] };

export default function Home() {
  const { t, locale, dir } = useI18n();
  const fa = locale === "fa";
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [trend, setTrend] = useState<{ items: Product[]; queries_fa: string[]; queries_en: string[] } | null>(null);
  const [cols, setCols] = useState<Collection[]>([]);

  useEffect(() => {
    get<typeof trend>("/trending").then(setTrend).catch(() => {});
    get<{ collections: Collection[] }>("/collections").then((d) => setCols(d.collections)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* HERO */}
      <section className="relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold">
            <Sparkles size={13} className="text-[var(--color-neon)]" />{t("hero_kicker")}
          </span>
          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero_1")}<br /><span className="grad-text">{t("hero_2")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed muted">{t("hero_sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search"><Btn><Camera size={17} />{t("cta_scan")}</Btn></Link>
            <Link href="/search?browse=1"><Btn variant="ghost">{t("cta_browse")}<Arrow size={16} /></Btn></Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[[num(72, locale), t("stat1")], [num("0.4s", locale), t("stat2")], [num(94, locale) + "٪", t("stat3")]].map(([v, l]) => (
              <div key={l} className="glass rounded-2xl p-3 text-center">
                <div className="text-xl font-black grad-text">{v}</div>
                <div className="mt-0.5 text-[10px] leading-tight muted">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-[3rem] grad-bg opacity-25 blur-3xl" />
            <div className="relative h-full w-full overflow-hidden rounded-[3rem] glass ring-glow">
              <div className="grid h-full grid-cols-2 gap-2 p-2">
                {(trend?.items || []).slice(0, 4).map((p, i) => (
                  <div key={p.id} className="overflow-hidden rounded-[1.6rem]"
                    style={{ animation: `drift ${9 + i * 2}s ease-in-out ${i * -3}s infinite alternate` }}>
                    <img src={img(p)} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {!trend && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton rounded-[1.6rem]" />)}
              </div>
              <div className="pointer-events-none absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-[var(--color-neon)]/25 to-transparent scanline" />
              <div className="absolute bottom-4 start-4 end-4 glass rounded-2xl px-4 py-3 text-xs font-bold backdrop-blur-xl">
                <span className="grad-text">{t("scanning")}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* TRENDING QUERIES */}
      <Reveal className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {(fa ? trend?.queries_fa : trend?.queries_en)?.map((q) => (
          <Link key={q} href={`/search?q=${encodeURIComponent(q)}`}
            className="glass shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition hover:scale-105 hover:border-[var(--color-brand-300)]">
            🔥 {q}
          </Link>
        ))}
      </Reveal>

      {/* HOW */}
      <section className="py-20">
        <Reveal><h2 className="mb-8 text-3xl font-black sm:text-4xl">{t("how")}</h2></Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {[[Camera, t("how1_t"), t("how1_s")], [Cpu, t("how2_t"), t("how2_s")], [ShoppingBag, t("how3_t"), t("how3_s")]]
            .map(([Icon, title, sub], i) => {
              const I = Icon as typeof Camera;
              return (
                <Reveal key={String(title)} delay={i * 90}>
                  <div className="group h-full rounded-3xl glass p-6 ring-glow transition duration-500 hover:-translate-y-1.5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl grad-bg text-white shadow-lg shadow-[var(--glow)]">
                      <I size={20} />
                    </span>
                    <h3 className="mt-4 text-lg font-extrabold">{String(title)}</h3>
                    <p className="mt-1.5 text-sm muted">{String(sub)}</p>
                    <span className="mt-4 block text-5xl font-black opacity-10">{num(i + 1, locale)}</span>
                  </div>
                </Reveal>
              );
            })}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="pb-20">
        <Reveal><h2 className="mb-8 text-3xl font-black sm:text-4xl">{t("collections")}</h2></Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {cols.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <Link href={`/search?color=${c.colors[0]}`} className="group relative block overflow-hidden rounded-[2rem] ring-glow">
                <div className="grid grid-cols-3">
                  {c.items.slice(0, 3).map((p) => (
                    <img key={p.id} src={img(p)} alt="" loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-110" />
                  ))}
                </div>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.tint}dd, transparent 65%)` }} />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-xl font-black">{fa ? c.title_fa : c.title_en}</h3>
                  <p className="text-xs opacity-85">{fa ? c.sub_fa : c.sub_en} · {num(c.count, locale)} {t("items")}</p>
                </div>
              </Link>
            </Reveal>
          ))}
          {!cols.length && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-[2rem]" />)}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="pb-20">
        <Reveal><h2 className="mb-8 text-3xl font-black sm:text-4xl">{t("trending")}</h2></Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {(trend?.items || []).slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          {!trend && Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>

      {/* BANDS */}
      <section className="grid gap-4 pb-24 md:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between gap-5 rounded-[2rem] glass p-7 ring-glow">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl grad-bg text-white"><Wand2 size={19} /></span>
              <h3 className="mt-4 text-2xl font-black">{t("stylist_t")}</h3>
              <p className="mt-2 text-sm muted">{t("stylist_s")}</p>
            </div>
            <Link href="/stylist"><Btn variant="ghost">{t("nav_stylist")}<Arrow size={15} /></Btn></Link>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="flex h-full flex-col justify-between gap-5 rounded-[2rem] p-7 text-white ring-glow grad-bg">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><Store size={19} /></span>
              <h3 className="mt-4 text-2xl font-black">{t("sellers_t")}</h3>
              <p className="mt-2 text-sm opacity-90">{t("sellers_s")}</p>
            </div>
            <Link href="/sellers">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-[var(--color-brand-700)] transition hover:-translate-y-0.5">
                {t("view")}<Arrow size={15} />
              </span>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
