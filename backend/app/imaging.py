"""Product image synthesis + lightweight visual-feature extraction."""
from __future__ import annotations
import io, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W = H = 640
_cache: dict[str, bytes] = {}


def _hex(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore


def _shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


def _silhouette(cat: str) -> list[tuple[float, float]]:
    s = {
        "dress": [(.5,.06),(.66,.13),(.62,.34),(.78,.92),(.22,.92),(.38,.34),(.34,.13)],
        "shirt": [(.5,.08),(.72,.14),(.80,.40),(.68,.42),(.70,.86),(.30,.86),(.32,.42),(.20,.40),(.28,.14)],
        "tshirt":[(.5,.10),(.70,.16),(.82,.36),(.70,.40),(.72,.82),(.28,.82),(.30,.40),(.18,.36),(.30,.16)],
        "coat":  [(.5,.07),(.74,.13),(.84,.46),(.72,.48),(.74,.92),(.26,.92),(.28,.48),(.16,.46),(.26,.13)],
        "bag":   [(.24,.34),(.76,.34),(.84,.84),(.16,.84)],
        "shoe":  [(.14,.70),(.30,.40),(.46,.38),(.58,.52),(.86,.64),(.88,.74),(.14,.74)],
        "scarf": [(.18,.16),(.82,.24),(.72,.86),(.28,.80)],
        "jeans": [(.30,.10),(.70,.10),(.74,.92),(.56,.92),(.50,.48),(.44,.92),(.26,.92)],
    }[cat]
    return [(x * W, y * H) for x, y in s]


def _pattern(draw: ImageDraw.ImageDraw, pat: str, base, rnd: random.Random):
    acc = _shade(base, 1.55 if sum(base) < 330 else 0.6)
    if pat == "stripe":
        for x in range(-H, W, 46):
            draw.line([(x, 0), (x + H, H)], fill=acc, width=16)
    elif pat == "dot":
        for y in range(20, H, 62):
            for x in range(20 + (y // 62 % 2) * 31, W, 62):
                draw.ellipse([x - 11, y - 11, x + 11, y + 11], fill=acc)
    elif pat == "check":
        for x in range(0, W, 64):
            draw.rectangle([x, 0, x + 26, H], fill=acc)
        for y in range(0, H, 64):
            draw.rectangle([0, y, W, y + 26], fill=acc)
    elif pat == "leopard":
        for _ in range(130):
            x, y, r = rnd.randrange(W), rnd.randrange(H), rnd.randrange(10, 26)
            draw.ellipse([x - r, y - r, x + r, y + int(r * .7)], fill=_shade(base, .35))
            draw.ellipse([x - r + 6, y - r + 5, x + r - 6, y + int(r * .7) - 5], fill=acc)
    elif pat == "floral":
        for _ in range(46):
            x, y, r = rnd.randrange(W), rnd.randrange(H), rnd.randrange(14, 30)
            for k in range(6):
                a = k * math.pi / 3
                cx, cy = x + math.cos(a) * r, y + math.sin(a) * r
                draw.ellipse([cx - r * .6, cy - r * .6, cx + r * .6, cy + r * .6], fill=acc)


def render(p: dict) -> bytes:
    key = p["id"]
    if key in _cache:
        return _cache[key]
    rnd = random.Random(p["seed"] * 977)
    base = _hex(p["hex"])
    # backdrop: soft studio gradient tinted by the garment colour
    bg = Image.new("RGB", (W, H), (20, 20, 24))
    g = ImageDraw.Draw(bg)
    top, bot = _shade(base, .35), (14, 14, 18)
    for y in range(H):
        t = y / H
        g.line([(0, y), (W, y)], fill=tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3)))
    bg = bg.filter(ImageFilter.GaussianBlur(8))
    # garment layer
    fab = Image.new("RGB", (W, H), base)
    _pattern(ImageDraw.Draw(fab), p["pattern"], base, rnd)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).polygon(_silhouette(p["category"]), fill=255)
    sh = sh.filter(ImageFilter.GaussianBlur(1.6))
    # fabric shading for depth
    shade = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shade)
    for i in range(W):
        sd.line([(i, 0), (i, H)], fill=int(60 + 120 * math.sin(math.pi * i / W)))
    fab = Image.composite(fab, Image.new("RGB", (W, H), _shade(base, .55)),
                          shade.point(lambda v: 255 if v > 120 else 90))
    out = Image.composite(fab, bg, sh)
    buf = io.BytesIO()
    out.save(buf, "JPEG", quality=86)
    _cache[key] = buf.getvalue()
    return _cache[key]


HUE_BINS = 18


def features(img: Image.Image) -> np.ndarray:
    """Colour-histogram + texture descriptor, robust to size and lighting."""
    im = img.convert("RGB").resize((96, 96))
    hsv = np.asarray(im.convert("HSV"), dtype=np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    w = (s * v).ravel() + 1e-6
    hist, _ = np.histogram(h.ravel(), bins=HUE_BINS, range=(0, 1), weights=w)
    hist = hist / (hist.sum() + 1e-6)
    gray = np.asarray(im.convert("L"), dtype=np.float32) / 255.0
    gx = np.abs(np.diff(gray, axis=1)).mean()
    gy = np.abs(np.diff(gray, axis=0)).mean()
    vhist, _ = np.histogram(v.ravel(), bins=6, range=(0, 1))
    vhist = vhist / vhist.sum()
    extra = np.array([s.mean(), v.mean(), v.std(), gx * 6, gy * 6, float(gx + gy > .10)], dtype=np.float32)
    vec = np.concatenate([hist * 2.2, vhist * 1.1, extra])
    return vec / (np.linalg.norm(vec) + 1e-6)


def features_of_product(p: dict) -> np.ndarray:
    return features(Image.open(io.BytesIO(render(p))))


def similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))
