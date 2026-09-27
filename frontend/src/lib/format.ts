const FA = "۰۱۲۳۴۵۶۷۸۹";
export const faDigits = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
export function price(v: number, locale: "fa" | "en") {
  const s = v.toLocaleString("en-US");
  return locale === "fa" ? faDigits(s) : s;
}
export const num = (v: number | string, locale: "fa" | "en") =>
  locale === "fa" ? faDigits(v) : String(v);
