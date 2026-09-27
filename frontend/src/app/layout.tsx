import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/i18n";
import Nav from "@/components/Nav";
import { Aurora } from "@/components/ui";

export const metadata: Metadata = {
  title: "LookYab — لوک‌یاب | Visual fashion search",
  description: "Snap any garment and find shoppable matches from Iranian stores. جست‌وجوی تصویری پوشاک.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "LookYab", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#06060a" },
               { media: "(prefers-color-scheme: light)", color: "#f4f5fa" }],
  width: "device-width", initialScale: 1, viewportFit: "cover",
};

const noFlash = `(()=>{try{const t=localStorage.getItem('ly-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');const l=localStorage.getItem('ly-locale')||'fa';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.lang=l;document.documentElement.dir=l==='fa'?'rtl':'ltr';}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&family=Vazirmatn:wght@400;600;800&display=swap" />
      </head>
      <body>
        <Providers>
          <Aurora />
          <Nav />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 text-center text-xs muted">
        <span className="grad-text text-sm font-extrabold">LookYab · لوک‌یاب</span>
        <span>ASAP54 model · Iran market · FastAPI + Next.js</span>
      </div>
    </footer>
  );
}
