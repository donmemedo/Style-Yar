"use client";
import { useState } from "react";
import { Check, Loader2, Send, Wand2 } from "lucide-react";
import { post } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { num } from "@/lib/format";
import { Btn, Reveal } from "@/components/ui";

type Res = { ticket: string; eta_hours: number; queue: number; message_fa: string; message_en: string };

export default function Page() {
  const { t, locale } = useI18n();
  const fa = locale === "fa";
  const [form, setForm] = useState({ name: "", contact: "", note: "", budget: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Res | null>(null);
  const [err, setErr] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(false);
    try {
      setDone(await post<Res>("/stylist", {
        name: form.name, contact: form.contact, note: form.note,
        budget: form.budget ? Number(form.budget) : null, locale,
      }));
    } catch { setErr(true); }
    setBusy(false);
  };

  const field = "glass w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brand-300)]";

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-24 pt-10 sm:px-6 md:grid-cols-2 md:items-center">
      <Reveal>
        <span className="grid h-14 w-14 place-items-center rounded-3xl grad-bg text-white shadow-xl shadow-[var(--glow)]">
          <Wand2 size={24} />
        </span>
        <h1 className="mt-5 text-4xl font-black leading-tight">{t("stylist_t")}</h1>
        <p className="mt-3 text-sm muted">{t("stylist_s")}</p>
        <div className="mt-6 space-y-2 text-sm">
          {[t("how1_s"), t("how2_s"), t("how3_s")].map((s) => (
            <p key={s} className="flex items-start gap-2 muted">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-neon)]" />{s}
            </p>
          ))}
        </div>
      </Reveal>

      <Reveal delay={90}>
        {done ? (
          <div className="rounded-[2rem] glass p-8 text-center ring-glow">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full grad-bg text-white"><Check size={26} /></span>
            <p className="mt-4 font-bold">{fa ? done.message_fa : done.message_en}</p>
            <p className="mt-3 text-sm muted">
              {t("ticket")}: <span className="grad-text font-black">{done.ticket}</span> · {num(done.queue, locale)} {t("queue")}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 rounded-[2rem] glass p-6 ring-glow">
            <input required minLength={2} className={field} placeholder={t("name")}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required minLength={5} className={field} placeholder={t("contact")}
              value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <input type="number" min={0} className={field} placeholder={t("budget")}
              value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <textarea rows={4} className={field} placeholder={t("note")}
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            {err && <p className="text-xs font-bold text-[var(--color-flare)]">✕</p>}
            <Btn type="submit" disabled={busy} className="w-full">
              {busy ? <><Loader2 className="animate-spin" size={16} />{t("sending")}</> : <><Send size={16} />{t("send")}</>}
            </Btn>
          </form>
        )}
      </Reveal>
    </div>
  );
}
