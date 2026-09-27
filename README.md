# LookYab · لوک‌یاب — visual fashion search

“Shazam for fashion”, built from the **ASAP54** business model in this folder and localised for the Iranian market.
Photograph any garment, bag or pattern → the engine reads colour, pattern, silhouette and texture → it returns the closest **shoppable** items from partner stores, with price, size, stock and delivery. If confidence is low, a human stylist takes over (Concierge MVP).

## Stack
| | |
|---|---|
| `frontend/` | Next.js 15 (App Router, standalone), TypeScript, Tailwind v4, lucide-react. Dark/light, FA(RTL)/EN(LTR), fully responsive, PWA-ready manifest. |
| `backend/` | FastAPI + Pillow + NumPy. Synthesises the catalogue imagery, indexes each item with an HSV-histogram + texture descriptor, and ranks uploads by cosine similarity. |

## Run
```bash
docker compose up --build        # web → http://localhost:3054   api → http://localhost:8054/docs
```
Local dev without Docker:
```bash
cd backend  && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/uvicorn app.main:app --port 8054
cd frontend && npm install && npm run dev        # http://localhost:3054
```
The frontend proxies `/api/*` to the backend (`API_INTERNAL_URL`), so no CORS or public API URL is needed.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health`, `/api/meta` | status, categories, colours, price range |
| GET | `/api/products`, `/api/products/{id}` | filter/sort catalogue; detail + visually similar |
| GET | `/api/images/{id}.jpg` | generated product image |
| POST | `/api/search/image` | upload a photo → ranked matches, palette, confidence, stylist fallback |
| POST | `/api/search/color` | search by a colour swatch |
| POST | `/api/stylist` | stylist request (24h SLA) |
| GET | `/api/trending`, `/api/collections`, `/api/sellers/stats` | home feed, shoppable collections, seller demand panel |

## Screens
`/` home · `/search` visual search · `/product/[id]` detail + similar · `/stylist` concierge · `/sellers` seller panel (demand + estimated sales).

## Persian UX writing
Copy follows the Persian UX vocabulary reference: «جست‌وجو»، «حساب کاربری»، «سبد خرید»، «سفارش»، «دیدگاه»، «پیش‌خوان»، «افزودن»، «بازگشت»، «پالایه». Persian digits are rendered locally; prices are in Toman.

## Next steps
PWA service worker + install prompt, then wrapping the same build as **APK** (TWA / Capacitor) and **IPA** (Capacitor + Xcode).
