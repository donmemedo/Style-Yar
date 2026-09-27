"use client";
import { useEffect, useState } from "react";
import { BarChart3, Percent, Star, Ticket, TrendingUp } from "lucide-react";
import { get } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num, price } from "@/lib/format";
import { Reveal } from "@/components/ui";

type Stats = {
  shops: { shop: string; fa: string; en: string; items: number; likes: number; revenue: number; rating: number }[];
  demand: { key: string; fa: string; en: string; searches: number }[];
  kpi: { commission_rate: number; monthly_orders: number; conversion: number; stylist_tickets: number };
};

export default function Page() {
  const { t, locale } = useI18n();
  const fa = locale === "fa";
  const [d, setD] = useState<Stats | null>(null);
  useEffect(() => { get<Stats>("/sellers/stats").then(setD).catch(() => {}); }, []);

  const max = d ? Math.max(...d.demand.map((x) => x.searches)) : 1;
  const kpis = d ? [
    [TrendingUp, t("kpi_orders"), num(d.kpi.monthly_orders.toLocaleString("en-US"), locale)],
    [Percent, t("kpi_conv"), num(d.kpi.conversion, locale) + "٪"],
    [BarChart3, t("kpi_comm"), num(d.kpi.commission_rate, locale) + "٪"],
    [Ticket, t("kpi_tickets"), num(d.kpi.stylist_tickets, locale)],
  ] as const : [];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal>
        <h1 className="text-4xl font-black">{t("sellers_t")}</h1>
        <p className="mt-2 text-sm muted">{t("sellers_s")}</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([Icon, label, value], i) => (
          <Reveal key={label} delay={i * 70}>
            <div className="rounded-3xl glass p-5 ring-glow">
              <Icon size={18} className="text-[var(--color-neon)]" />
              <div className="mt-3 text-2xl font-black grad-text">{value}</div>
              <div className="text-[11px] muted">{label}</div>
            </div>
          </Reveal>
        ))}
        {!d && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-[2rem] glass p-6 ring-glow">
            <h2 className="mb-5 text-lg font-extrabold">{t("demand")}</h2>
            <div className="space-y-3">
              {d?.demand.map((x, i) => (
                <div key={x.key}>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>{fa ? x.fa : x.en}</span>
                    <span className="muted">{num(x.searches.toLocaleString("en-US"), locale)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--line)]">
                    <div className="h-full rounded-full grad-bg"
                      style={{ width: `${(x.searches / max) * 100}%`, transition: `width 1s ${i * 80}ms cubic-bezier(.2,.7,.2,1)` }} />
                  </div>
                </div>
              ))}
              {!d && Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}
            </div>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="overflow-hidden rounded-[2rem] glass ring-glow">
            <h2 className="p-6 pb-3 text-lg font-extrabold">{t("partners")}</h2>
            <table className="w-full text-sm">
              <thead className="text-[11px] muted">
                <tr className="border-b border-[var(--line)]">
                  <th className="p-3 text-start font-bold">{t("shop")}</th>
                  <th className="p-3 text-start font-bold">{t("items")}</th>
                  <th className="p-3 text-start font-bold">{t("rating")}</th>
                  <th className="p-3 text-start font-bold">{t("revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {d?.shops.map((s) => (
                  <tr key={s.shop} className="border-b border-[var(--line)] transition hover:bg-[var(--glass)]">
                    <td className="p-3 font-bold">{fa ? s.fa : s.en}</td>
                    <td className="p-3 muted">{num(s.items, locale)}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1">
                        <Star size={12} className="fill-[var(--color-amberish)] text-[var(--color-amberish)]" />
                        {num(s.rating, locale)}
                      </span>
                    </td>
                    <td className="p-3 font-bold grad-text">{price(Math.round(s.revenue / 1e6), locale)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
