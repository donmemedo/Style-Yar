export const API = process.env.NEXT_PUBLIC_API_BASE || "/api";

export type Product = {
  id: string; category: string; category_fa: string; category_en: string;
  title_fa: string; title_en: string; color: string; color_fa: string; color_en: string;
  hex: string; pattern: string; pattern_fa: string; pattern_en: string;
  style_fa: string; style_en: string; shop: string; shop_fa: string; shop_en: string;
  shop_rating: number; price: number; discount: number; final_price: number;
  rating: number; reviews: number; sizes: string[]; stock: number;
  delivery_days: number; likes: number; image: string; match?: number;
};
export type SearchResult = {
  items: Product[]; palette: string[]; confidence: number;
  needs_stylist: boolean; took_ms: number;
};

const j = async (r: Response) => {
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};
export const get = <T,>(p: string) => fetch(`${API}${p}`, { cache: "no-store" }).then(j) as Promise<T>;
export const post = <T,>(p: string, body: unknown) =>
  fetch(`${API}${p}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }).then(j) as Promise<T>;
export const searchImage = (file: File, category?: string) => {
  const fd = new FormData();
  fd.append("file", file);
  const q = category ? `?category=${category}` : "";
  return fetch(`${API}/search/image${q}`, { method: "POST", body: fd }).then(j) as Promise<SearchResult>;
};
export const img = (p: Product) => `${API}${p.image.replace("/api", "")}`;
