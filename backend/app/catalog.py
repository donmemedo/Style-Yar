"""Deterministic demo catalog for LookYab / لوک‌یاب."""
from __future__ import annotations
import hashlib, random

CATEGORIES = [
    ("dress", "پیراهن زنانه", "Dress"),
    ("shirt", "پیراهن مردانه", "Shirt"),
    ("tshirt", "تی‌شرت", "T-shirt"),
    ("coat", "پالتو و مانتو", "Coat"),
    ("bag", "کیف", "Bag"),
    ("shoe", "کفش", "Shoes"),
    ("scarf", "شال و روسری", "Scarf"),
    ("jeans", "شلوار جین", "Jeans"),
]

COLORS = [
    ("black", "مشکی", "Black", "#15161a"),
    ("white", "سفید", "White", "#eceef2"),
    ("crimson", "زرشکی", "Crimson", "#9d1731"),
    ("red", "قرمز", "Red", "#e03131"),
    ("blue", "آبی", "Blue", "#2563c9"),
    ("navy", "سرمه‌ای", "Navy", "#1b2a55"),
    ("green", "سبز", "Green", "#1f8a5a"),
    ("olive", "زیتونی", "Olive", "#6b7434"),
    ("beige", "کرم", "Beige", "#ddc8a8"),
    ("camel", "شتری", "Camel", "#b4804a"),
    ("pink", "صورتی", "Pink", "#e26a92"),
    ("purple", "بنفش", "Purple", "#6d4bb5"),
    ("mustard", "خردلی", "Mustard", "#d8a326"),
    ("gray", "طوسی", "Gray", "#8b9099"),
    ("turquoise", "فیروزه‌ای", "Turquoise", "#2bb3ad"),
    ("brown", "قهوه‌ای", "Brown", "#6b4630"),
]

PATTERNS = [
    ("solid", "ساده", "Solid"),
    ("stripe", "راه‌راه", "Striped"),
    ("dot", "خال‌خالی", "Polka dot"),
    ("leopard", "پلنگی", "Leopard"),
    ("floral", "گل‌دار", "Floral"),
    ("check", "چهارخانه", "Checked"),
]

SHOPS = [
    ("digistyle", "دیجی‌استایل", "Digistyle", 4.6),
    ("modiseh", "مدیسه", "Modiseh", 4.4),
    ("banimode", "بانی‌مد", "Banimode", 4.3),
    ("dorsa", "چرم درسا", "Dorsa Leather", 4.7),
    ("kafshmelli", "کفش ملی", "Kafsh-e Melli", 4.2),
    ("zibamo", "زیبامو", "Zibamo", 4.1),
    ("basalam", "باسلام", "Basalam", 4.5),
]

STYLES_FA = ["مینیمال", "کژوال", "مجلسی", "اداری", "استریت", "بوهو", "کلاسیک", "اسپرت"]
STYLES_EN = ["Minimal", "Casual", "Evening", "Office", "Street", "Boho", "Classic", "Sport"]
SIZES = ["XS", "S", "M", "L", "XL", "2XL", "36", "38", "40", "42", "44"]


def _price(cat: str, rnd: random.Random) -> int:
    base = {"dress": 2_900_000, "shirt": 1_600_000, "tshirt": 890_000, "coat": 4_800_000,
            "bag": 3_400_000, "shoe": 3_100_000, "scarf": 690_000, "jeans": 1_950_000}[cat]
    return int(base * rnd.uniform(0.6, 1.8) / 10_000) * 10_000


def build() -> list[dict]:
    items: list[dict] = []
    rnd = random.Random(54)
    idx = 0
    for ck, cfa, cen in CATEGORIES:
        for _ in range(9):
            idx += 1
            color = rnd.choice(COLORS)
            pat = rnd.choice(PATTERNS if ck not in ("shoe", "bag") else PATTERNS[:2])
            shop = rnd.choice(SHOPS)
            s = rnd.randrange(len(STYLES_FA))
            price = _price(ck, rnd)
            off = rnd.choice([0, 0, 0, 10, 15, 20, 30, 45])
            pid = hashlib.md5(f"{ck}{idx}".encode()).hexdigest()[:8]
            items.append({
                "id": pid,
                "category": ck,
                "category_fa": cfa,
                "category_en": cen,
                "title_fa": f"{cfa} {pat[1]} {color[1]}",
                "title_en": f"{color[2]} {pat[2].lower()} {cen.lower()}",
                "color": color[0], "color_fa": color[1], "color_en": color[2], "hex": color[3],
                "pattern": pat[0], "pattern_fa": pat[1], "pattern_en": pat[2],
                "style_fa": STYLES_FA[s], "style_en": STYLES_EN[s],
                "shop": shop[0], "shop_fa": shop[1], "shop_en": shop[2], "shop_rating": shop[3],
                "price": price,
                "discount": off,
                "final_price": int(price * (100 - off) / 100 / 10_000) * 10_000,
                "rating": round(rnd.uniform(3.6, 5.0), 1),
                "reviews": rnd.randrange(12, 940),
                "sizes": rnd.sample(SIZES[:6] if ck not in ("shoe",) else SIZES[6:], 4),
                "stock": rnd.randrange(0, 40),
                "delivery_days": rnd.choice([1, 1, 2, 3, 5]),
                "likes": rnd.randrange(30, 4200),
                "seed": idx,
            })
    return items


PRODUCTS = build()
BY_ID = {p["id"]: p for p in PRODUCTS}

COLLECTIONS = [
    {"id": "tehran-night", "title_fa": "شب‌های تهران", "title_en": "Tehran Nights",
     "sub_fa": "مجلسی، تیره، درخشان", "sub_en": "Evening, dark, luminous",
     "colors": ["black", "crimson", "purple"], "tint": "#9d1731"},
    {"id": "office-calm", "title_fa": "آرامش اداری", "title_en": "Quiet Office",
     "sub_fa": "خنثی و مینیمال", "sub_en": "Neutral & minimal",
     "colors": ["beige", "camel", "navy"], "tint": "#b4804a"},
    {"id": "street-54", "title_fa": "استریت ۵۴", "title_en": "Street 54",
     "sub_fa": "پررنگ و بی‌قید", "sub_en": "Loud & unbothered",
     "colors": ["mustard", "turquoise", "red"], "tint": "#d8a326"},
    {"id": "soft-spring", "title_fa": "بهار ملایم", "title_en": "Soft Spring",
     "sub_fa": "پاستیل و گل‌دار", "sub_en": "Pastel & floral",
     "colors": ["pink", "white", "green"], "tint": "#e26a92"},
]
