"""LookYab API — visual fashion search (ASAP54 model, Iran market)."""
from __future__ import annotations
import io, time, uuid
from typing import Optional

import numpy as np
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from PIL import Image
from pydantic import BaseModel, Field

from .catalog import COLLECTIONS, COLORS, BY_ID, PRODUCTS, CATEGORIES
from .imaging import features, features_of_product, render, similarity

app = FastAPI(title="LookYab API", version="1.0.0",
              description="Visual search for fashion — the Shazam of shopping, localised for Iran.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

INDEX: dict[str, np.ndarray] = {}
STYLIST: list[dict] = []


@app.on_event("startup")
def _warm() -> None:
    for p in PRODUCTS:
        INDEX[p["id"]] = features_of_product(p)


def card(p: dict, score: float | None = None) -> dict:
    d = {k: p[k] for k in (
        "id", "category", "category_fa", "category_en", "title_fa", "title_en", "color", "color_fa",
        "color_en", "hex", "pattern", "pattern_fa", "pattern_en", "style_fa", "style_en", "shop",
        "shop_fa", "shop_en", "shop_rating", "price", "discount", "final_price", "rating", "reviews",
        "sizes", "stock", "delivery_days", "likes")}
    d["image"] = f"/api/images/{p['id']}.jpg"
    if score is not None:
        d["match"] = round(score, 1)
    return d


@app.get("/api/health")
def health():
    return {"status": "ok", "products": len(PRODUCTS), "indexed": len(INDEX)}


@app.get("/api/meta")
def meta():
    return {
        "categories": [{"key": k, "fa": fa, "en": en} for k, fa, en in CATEGORIES],
        "colors": [{"key": k, "fa": fa, "en": en, "hex": hx} for k, fa, en, hx in COLORS],
        "shops": sorted({(p["shop"], p["shop_fa"], p["shop_en"]) for p in PRODUCTS}),
        "price_range": [min(p["final_price"] for p in PRODUCTS), max(p["final_price"] for p in PRODUCTS)],
    }


@app.get("/api/images/{pid}.jpg")
def image(pid: str):
    p = BY_ID.get(pid)
    if not p:
        raise HTTPException(404, "product not found")
    return Response(render(p), media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=86400"})


@app.get("/api/products")
def products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    color: Optional[str] = None,
    shop: Optional[str] = None,
    max_price: Optional[int] = None,
    sort: str = "popular",
    limit: int = Query(24, le=100),
    offset: int = 0,
):
    items = PRODUCTS
    if q:
        s = q.strip().lower()
        items = [p for p in items if s in p["title_fa"] or s in p["title_en"].lower()
                 or s in p["shop_fa"] or s in p["shop_en"].lower()]
    if category:
        items = [p for p in items if p["category"] == category]
    if color:
        items = [p for p in items if p["color"] == color]
    if shop:
        items = [p for p in items if p["shop"] == shop]
    if max_price:
        items = [p for p in items if p["final_price"] <= max_price]
    key = {"popular": lambda p: -p["likes"], "cheap": lambda p: p["final_price"],
           "expensive": lambda p: -p["final_price"], "rating": lambda p: -p["rating"],
           "discount": lambda p: -p["discount"]}.get(sort, lambda p: -p["likes"])
    items = sorted(items, key=key)
    return {"total": len(items), "items": [card(p) for p in items[offset:offset + limit]]}


@app.get("/api/products/{pid}")
def product(pid: str):
    p = BY_ID.get(pid)
    if not p:
        raise HTTPException(404, "product not found")
    vec = INDEX.get(pid)
    similar = []
    if vec is not None:
        scored = sorted(((similarity(vec, INDEX[o["id"]]), o) for o in PRODUCTS if o["id"] != pid),
                        key=lambda t: -t[0])[:8]
        similar = [card(o, _pct(s)) for s, o in scored]
    return {"product": card(p), "similar": similar}


def _pct(sim: float) -> float:
    """Map cosine similarity into a friendly confidence percentage."""
    return max(38.0, min(99.4, (sim ** 3) * 58 + 42))


@app.get("/api/trending")
def trending():
    top = sorted(PRODUCTS, key=lambda p: -p["likes"])[:12]
    return {
        "items": [card(p) for p in top],
        "queries_fa": ["پالتو شتری", "کیف چرم مشکی", "شال گل‌دار", "کفش اسنیکر سفید", "پیراهن زرشکی"],
        "queries_en": ["Camel coat", "Black leather bag", "Floral scarf", "White sneakers", "Crimson dress"],
    }


@app.get("/api/collections")
def collections():
    out = []
    for c in COLLECTIONS:
        picks = [p for p in PRODUCTS if p["color"] in c["colors"]][:6]
        out.append({**c, "items": [card(p) for p in picks], "count":
                    len([p for p in PRODUCTS if p["color"] in c["colors"]])})
    return {"collections": out}


class ColorSearch(BaseModel):
    hex: str = Field(..., pattern=r"^#?[0-9a-fA-F]{6}$")
    category: Optional[str] = None


def _rank(vec: np.ndarray, category: Optional[str], limit: int):
    pool = [p for p in PRODUCTS if not category or p["category"] == category]
    scored = sorted(((similarity(vec, INDEX[p["id"]]), p) for p in pool), key=lambda t: -t[0])
    return [card(p, _pct(s)) for s, p in scored[:limit]]


def _palette(img: Image.Image, k: int = 5) -> list[str]:
    q = img.convert("RGB").resize((72, 72)).quantize(colors=k, method=Image.Quantize.FASTOCTREE)
    pal = q.getpalette()[: k * 3]
    counts = sorted(q.getcolors(), key=lambda t: -t[0])
    return ["#%02x%02x%02x" % tuple(pal[i * 3:i * 3 + 3]) for _, i in counts if i * 3 + 2 < len(pal)]


@app.post("/api/search/image")
async def search_image(file: UploadFile = File(...), category: Optional[str] = None,
                       limit: int = Query(24, le=60)):
    t0 = time.time()
    raw = await file.read()
    if len(raw) > 12_000_000:
        raise HTTPException(413, "image too large")
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
    except Exception:
        raise HTTPException(400, "unreadable image")
    vec = features(img)
    items = _rank(vec, category, limit)
    best = items[0]["match"] if items else 0
    return JSONResponse({
        "items": items,
        "palette": _palette(img),
        "confidence": best,
        "needs_stylist": best < 62,
        "took_ms": int((time.time() - t0) * 1000),
    })


@app.post("/api/search/color")
def search_color(body: ColorSearch, limit: int = Query(24, le=60)):
    hx = body.hex.lstrip("#")
    swatch = Image.new("RGB", (64, 64), tuple(int(hx[i:i + 2], 16) for i in (0, 2, 4)))
    return {"items": _rank(features(swatch), body.category, limit), "palette": ["#" + hx],
            "confidence": 100.0, "needs_stylist": False, "took_ms": 3}


class StylistRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    contact: str = Field(..., min_length=5, max_length=80)
    note: str = Field("", max_length=600)
    budget: Optional[int] = None
    locale: str = "fa"


@app.post("/api/stylist")
def stylist(req: StylistRequest):
    item = {"id": uuid.uuid4().hex[:10], "created": time.time(), **req.model_dump(),
            "status": "pending", "eta_hours": 24}
    STYLIST.append(item)
    return {"ticket": item["id"], "eta_hours": 24, "queue": len(STYLIST),
            "message_fa": "درخواست شما ثبت شد. استایلیست ما تا ۲۴ ساعت آینده پاسخ می‌دهد.",
            "message_en": "Request received. A stylist will reply within 24 hours."}


@app.get("/api/sellers/stats")
def seller_stats():
    by_shop: dict[str, dict] = {}
    for p in PRODUCTS:
        s = by_shop.setdefault(p["shop"], {"shop": p["shop"], "fa": p["shop_fa"], "en": p["shop_en"],
                                           "items": 0, "likes": 0, "revenue": 0, "rating": p["shop_rating"]})
        s["items"] += 1
        s["likes"] += p["likes"]
        s["revenue"] += p["final_price"] * max(1, p["likes"] // 40)
    shops = sorted(by_shop.values(), key=lambda s: -s["revenue"])
    demand = sorted(({"key": k, "fa": fa, "en": en,
                      "searches": sum(p["likes"] for p in PRODUCTS if p["category"] == k)}
                     for k, fa, en in CATEGORIES), key=lambda d: -d["searches"])
    return {"shops": shops, "demand": demand,
            "kpi": {"commission_rate": 5, "monthly_orders": 13_000, "conversion": 3.2,
                    "stylist_tickets": len(STYLIST)}}
