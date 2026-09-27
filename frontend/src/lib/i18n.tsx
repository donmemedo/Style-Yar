"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "fa" | "en";
export type Theme = "light" | "dark";

export const dict = {
  fa: {
    brand: "لوک‌یاب",
    tagline: "عکس بگیر، پیدا کن، بخر",
    nav_home: "خانه", nav_search: "جست‌وجوی تصویری", nav_stylist: "استایلیست",
    nav_sellers: "پیش‌خوان فروشندگان", nav_collections: "کالکشن‌ها",
    hero_kicker: "جست‌وجوی تصویری پوشاک",
    hero_1: "هر تصویری که دیدی،", hero_2: "بپوشش.",
    hero_sub: "از لباس، کیف یا هر الگویی که دوست داری عکس بگیر؛ لوک‌یاب نزدیک‌ترین محصول‌های قابل خرید از فروشگاه‌های ایرانی را پیدا می‌کند.",
    cta_scan: "عکس را بگذارید", cta_browse: "گشت‌وگذار در محصول‌ها",
    drop_title: "تصویر را اینجا رها کنید", drop_sub: "یا برای انتخاب از گوشی کلیک کنید — JPG، PNG یا WEBP",
    or_color: "یا با رنگ جست‌وجو کنید",
    scanning: "در حال تحلیل رنگ، طرح و فرم…",
    results: "نتیجه", match: "شباهت", palette: "پالت تصویر", took: "زمان پاسخ",
    filters: "پالایه‌ها", category: "دسته", color: "رنگ", sort: "چیدمان", all: "همه",
    sort_popular: "محبوب‌ترین", sort_cheap: "ارزان‌ترین", sort_expensive: "گران‌ترین",
    sort_rating: "بیشترین امتیاز", sort_discount: "بیشترین تخفیف",
    toman: "تومان", off: "تخفیف", add: "افزودن به سبد", added: "به سبد اضافه شد",
    fav: "علاقه‌مندی", delivery: "ارسال", days: "روز", instock: "موجود", outstock: "ناموجود",
    sizes: "سایزها", shop: "فروشگاه", similar: "محصول‌های مشابه", reviews: "دیدگاه",
    trending: "جست‌وجوهای داغ", collections: "کالکشن‌های قابل خرید", view: "مشاهده",
    how: "چطور کار می‌کند؟",
    how1_t: "عکس بگیرید", how1_s: "از ویترین، اینستاگرام یا خیابان.",
    how2_t: "موتور تصویری", how2_s: "رنگ، طرح، فرم و سبک تحلیل می‌شود.",
    how3_t: "خرید کنید", how3_s: "از فروشگاه‌های معتبر ایرانی، با قیمت و موجودی لحظه‌ای.",
    stylist_t: "چیزی پیدا نشد؟ استایلیست انسانی کمک می‌کند",
    stylist_s: "درخواست‌تان را بنویسید؛ کمتر از ۲۴ ساعت پاسخ می‌گیرید.",
    name: "نام", contact: "شماره تلفن همراه یا رایانامه", note: "توضیح درخواست",
    budget: "بودجه (تومان)", send: "ارسال درخواست", sending: "در حال ارسال…",
    ticket: "شماره پیگیری", queue: "در صف",
    sellers_t: "پیش‌خوان فروشندگان", sellers_s: "تقاضای واقعی بازار، پیش از تولید.",
    demand: "تقاضای دسته‌ها", revenue: "فروش برآوردی", items: "کالا", rating: "امتیاز",
    kpi_orders: "سفارش ماهانه", kpi_conv: "نرخ تبدیل", kpi_comm: "کمیسیون", kpi_tickets: "درخواست استایلیست",
    empty: "چیزی پیدا نشد", back: "بازگشت", theme: "پوسته", lang: "زبان",
    footer: "ساخته‌شده بر پایه مدل کسب‌وکار ASAP54 برای بازار ایران.",
    search_ph: "جست‌وجو کنید…", low_conf: "مطمئن نیستیم! بگذارید استایلیست نگاه کند.",
    partners: "فروشگاه‌های همراه", stat1: "محصول قابل خرید", stat2: "میانگین زمان پاسخ", stat3: "دقت تشخیص رنگ",
  },
  en: {
    brand: "LookYab",
    tagline: "Snap it. Find it. Wear it.",
    nav_home: "Home", nav_search: "Visual search", nav_stylist: "Stylist",
    nav_sellers: "Seller panel", nav_collections: "Collections",
    hero_kicker: "Visual fashion search",
    hero_1: "See it anywhere,", hero_2: "wear it.",
    hero_sub: "Photograph any garment, bag or pattern. LookYab finds the closest shoppable pieces from Iranian stores in under a second.",
    cta_scan: "Drop a photo", cta_browse: "Browse the catalogue",
    drop_title: "Drop an image here", drop_sub: "or click to pick one — JPG, PNG or WEBP",
    or_color: "or search by colour",
    scanning: "Reading colour, pattern and silhouette…",
    results: "results", match: "match", palette: "Image palette", took: "response",
    filters: "Filters", category: "Category", color: "Colour", sort: "Sort", all: "All",
    sort_popular: "Most popular", sort_cheap: "Lowest price", sort_expensive: "Highest price",
    sort_rating: "Top rated", sort_discount: "Biggest discount",
    toman: "Toman", off: "off", add: "Add to basket", added: "Added to basket",
    fav: "Favourite", delivery: "Delivery", days: "days", instock: "In stock", outstock: "Out of stock",
    sizes: "Sizes", shop: "Store", similar: "Similar pieces", reviews: "reviews",
    trending: "Trending searches", collections: "Shoppable collections", view: "View",
    how: "How it works",
    how1_t: "Take a picture", how1_s: "From a shop window, Instagram or the street.",
    how2_t: "Visual engine", how2_s: "Colour, pattern, silhouette and style get analysed.",
    how3_t: "Buy it", how3_s: "From trusted Iranian stores, with live price and stock.",
    stylist_t: "Nothing matched? A human stylist steps in",
    stylist_s: "Describe what you want — you get an answer in under 24 hours.",
    name: "Name", contact: "Mobile number or email", note: "What are you looking for?",
    budget: "Budget (Toman)", send: "Send request", sending: "Sending…",
    ticket: "Ticket", queue: "in queue",
    sellers_t: "Seller panel", sellers_s: "Real market demand, before you manufacture.",
    demand: "Category demand", revenue: "Estimated sales", items: "items", rating: "rating",
    kpi_orders: "Monthly orders", kpi_conv: "Conversion", kpi_comm: "Commission", kpi_tickets: "Stylist tickets",
    empty: "Nothing found", back: "Back", theme: "Theme", lang: "Language",
    footer: "Built on the ASAP54 business model, localised for Iran.",
    search_ph: "Search…", low_conf: "Not confident — let a stylist take a look.",
    partners: "Partner stores", stat1: "shoppable products", stat2: "avg. response", stat3: "colour accuracy",
  },
} as const;

export type Key = keyof typeof dict.fa;

type Ctx = {
  locale: Locale; theme: Theme; dir: "rtl" | "ltr";
  t: (k: Key) => string; setLocale: (l: Locale) => void; toggleTheme: () => void;
};
const C = createContext<Ctx | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const l = (localStorage.getItem("ly-locale") as Locale) || "fa";
    const t = (localStorage.getItem("ly-theme") as Theme) ||
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setLocaleState(l); setTheme(t);
  }, []);

  useEffect(() => {
    const h = document.documentElement;
    h.lang = locale; h.dir = locale === "fa" ? "rtl" : "ltr";
    h.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ly-locale", locale);
    localStorage.setItem("ly-theme", theme);
  }, [locale, theme]);

  const value: Ctx = {
    locale, theme, dir: locale === "fa" ? "rtl" : "ltr",
    t: (k) => dict[locale][k],
    setLocale: setLocaleState,
    toggleTheme: () => setTheme((v) => (v === "dark" ? "light" : "dark")),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useI18n() {
  const c = useContext(C);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
