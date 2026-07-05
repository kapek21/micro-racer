#!/usr/bin/env python3
"""Photorealistic tabletop backgrounds for Micro Machines-style racing (1200×800)."""
from __future__ import annotations

import math
import os
import random
from dataclasses import dataclass
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "sprites", "tables")
W, H = 1200, 800
RNG = random.Random(42)


@dataclass
class Theme:
    surface: tuple[int, int, int]
    surface_alt: tuple[int, int, int]
    rail: tuple[int, int, int]
    rail_hi: tuple[int, int, int]
    rail_lo: tuple[int, int, int]
    lamp: tuple[int, int, int]
    texture: str
    pockets: bool = False


THEMES: dict[str, Theme] = {
    "kitchen": Theme((232, 224, 212), (216, 208, 196), (107, 68, 35), (154, 104, 64), (61, 37, 16), (255, 232, 192), "laminate"),
    "roof": Theme((196, 165, 116), (184, 149, 100), (92, 58, 30), (139, 90, 48), (42, 24, 8), (255, 216, 144), "wood"),
    "garden": Theme((45, 122, 74), (37, 104, 64), (107, 68, 35), (154, 104, 64), (61, 37, 16), (255, 240, 192), "grass"),
    "garage": Theme((112, 120, 128), (96, 104, 112), (64, 72, 80), (96, 104, 112), (32, 36, 40), (255, 224, 160), "concrete"),
    "security": Theme((58, 40, 48), (48, 32, 40), (26, 16, 24), (74, 56, 64), (10, 8, 8), (255, 192, 208), "wood_dark"),
    "warehouse": Theme((200, 168, 120), (184, 152, 104), (80, 64, 48), (120, 96, 72), (40, 24, 16), (255, 232, 176), "wood"),
    "living": Theme((139, 96, 64), (123, 80, 48), (74, 48, 32), (122, 88, 64), (42, 24, 16), (255, 208, 160), "wood"),
    "balcony": Theme((176, 184, 192), (160, 168, 176), (80, 88, 96), (120, 128, 136), (48, 56, 64), (255, 248, 232), "tile"),
    "desk": Theme((212, 196, 168), (196, 180, 152), (107, 80, 48), (154, 120, 80), (58, 40, 16), (255, 255, 224), "laminate"),
    "city": Theme((26, 107, 58), (21, 88, 48), (92, 40, 24), (139, 64, 48), (42, 16, 8), (255, 240, 176), "felt", pockets=True),
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for biome, theme in THEMES.items():
        img = render_table(biome, theme)
        path = os.path.join(OUT, f"{biome}.png")
        img.save(path, "PNG", optimize=True)
        print(f"wrote {path} ({os.path.getsize(path) // 1024} KB)")
    print(f"Generated {len(THEMES)} table photos @ {W}x{H}.")


def render_table(biome: str, t: Theme) -> Image.Image:
    img = Image.new("RGB", (W, H))
    draw_parquet(img)
    draw_table_shadow(img)
    draw_rail(img, t)
    draw_playing_surface(img, t)
    if t.pockets:
        draw_pool_pockets(img)
        draw_pool_props(img)
    elif biome == "kitchen":
        draw_kitchen_props(img)
    elif biome == "desk":
        draw_desk_props(img)
    elif biome == "living":
        draw_living_props(img)
    draw_lamp(img, t.lamp)
    add_grain(img)
    add_vignette(img)
    return img


def draw_parquet(img: Image.Image) -> None:
    px = img.load()
    for y in range(H):
        for x in range(W):
            base = 18 + (y * 0.015)
            plank = ((y // 14) + (x // 56)) % 2
            r = int(base + plank * 8 + noise2d(x, y, 0.04) * 6)
            g = int(base * 0.7 + plank * 5 + noise2d(x + 99, y, 0.04) * 4)
            b = int(base * 0.45 + plank * 3)
            px[x, y] = (min(255, r), min(255, g), min(255, b))
    d = ImageDraw.Draw(img)
    for y in range(0, H, 14):
        d.line([(0, y), (W, y)], fill=(0, 0, 0), width=1)
    for x in range(0, W, 56):
        shade = 12 + (x // 56) % 3 * 4
        d.line([(x, 0), (x, H)], fill=(shade, shade // 2, 0), width=1)


def draw_table_shadow(img: Image.Image) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([20, 24, W - 20, H - 16], radius=18, fill=(0, 0, 0, 110))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=22))
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))


def draw_rail(img: Image.Image, t: Theme) -> None:
    x0, y0, x1, y1 = 16, 20, W - 16, H - 20
    d = ImageDraw.Draw(img)
    # Drop shadow under rail
    d.rounded_rectangle([x0 + 4, y0 + 6, x1 + 4, y1 + 6], radius=14, fill=t.rail_lo)
    # Body gradient via strips
    for i in range(y1 - y0):
        ty = i / max(1, y1 - y0 - 1)
        col = lerp3(t.rail_hi, t.rail_lo, ty * 0.55 + noise2d(x0, y0 + i, 0.08) * 0.08)
        d.line([(x0, y0 + i), (x1, y0 + i)], fill=col, width=1)
    # Wood grain lines
    gd = ImageDraw.Draw(img)
    for g in range(48):
        gy = y0 + 8 + g * (y1 - y0 - 16) / 48
        col = tuple(max(0, c - 20 - g % 5 * 8) for c in t.rail)
        gd.arc(
            [x0 - 40 + g, gy - 2, x1 + 40 - g, gy + 2],
            start=0, end=180,
            fill=col, width=1,
        )
    d.rounded_rectangle([x0, y0, x1, y1], radius=14, outline=t.rail_hi, width=3)
    d.rounded_rectangle([x0 + 6, y0 + 4, x1 - 6, y1 - 8], radius=10, outline=(255, 240, 220), width=2)
    d.rounded_rectangle([x0 + 36, y0 + 32, x1 - 36, y1 - 32], radius=8, outline=(0, 0, 0), width=2)


def draw_playing_surface(img: Image.Image, t: Theme) -> None:
    sx, sy, sw, sh = 52, 56, W - 104, H - 112
    surf = Image.new("RGB", (sw, sh), t.surface)
    fn = TEXTURES.get(t.texture, texture_laminate)
    fn(surf, t)
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw, sh], radius=10, fill=255)
    base = img.crop((sx, sy, sx + sw, sy + sh))
    base.paste(surf, (0, 0), mask)
    img.paste(base, (sx, sy))


def texture_felt(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    for y in range(sh):
        for x in range(sw):
            n = noise2d(x * 1.3, y * 1.3, 0.35)
            nap = noise2d(x * 0.4 + 200, y * 0.4, 0.12)
            r = clamp(t.surface[0] + n * 18 + nap * 8)
            g = clamp(t.surface[1] + n * 14 + nap * 6)
            b = clamp(t.surface[2] + n * 10 + nap * 4)
            px[x, y] = (r, g, b)
    # Brushed nap lines
    d = ImageDraw.Draw(surf)
    for i in range(0, sh, 2):
        a = 4 + (i % 4) * 2
        d.line([(0, i), (sw, i)], fill=(max(0, t.surface[0] - a), max(0, t.surface[1] - a), max(0, t.surface[2] - a)), width=1)


def texture_laminate(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    for y in range(sh):
        for x in range(sw):
            speck = noise2d(x * 2, y * 2, 0.5)
            r = clamp(t.surface[0] + speck * 12)
            g = clamp(t.surface[1] + speck * 10)
            b = clamp(t.surface[2] + speck * 8)
            px[x, y] = (r, g, b)


def texture_wood(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    for y in range(sh):
        for x in range(sw):
            grain = math.sin(x * 0.02 + y * 0.008) * 0.5 + noise2d(x, y, 0.15) * 0.5
            r = clamp(t.surface[0] + grain * 22)
            g = clamp(t.surface[1] + grain * 16)
            b = clamp(t.surface[2] + grain * 10)
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(surf)
    for i in range(36):
        gy = i * sh / 36
        d.arc([ -20, gy - 3, sw + 20, gy + 3], 0, 180, fill=t.rail_lo, width=1)


def texture_wood_dark(surf: Image.Image, t: Theme) -> None:
    texture_wood(surf, t)
    overlay = Image.new("RGBA", surf.size, (0, 0, 0, 45))
    surf.paste(Image.alpha_composite(surf.convert("RGBA"), overlay).convert("RGB"))


def texture_concrete(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    for y in range(sh):
        for x in range(sw):
            n = noise2d(x, y, 0.25)
            v = clamp(t.surface[0] + n * 20)
            px[x, y] = (v, v + 2, v + 4)


def texture_grass(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    for y in range(sh):
        for x in range(sw):
            n = noise2d(x * 1.5, y * 1.5, 0.4)
            r = clamp(t.surface[0] + n * 12)
            g = clamp(t.surface[1] + n * 18 + 8)
            b = clamp(t.surface[2] + n * 8)
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(surf)
    for _ in range(8000):
        x = RNG.randint(0, sw - 1)
        y = RNG.randint(0, sh - 1)
        c = clamp(t.surface[1] + RNG.randint(-20, 30))
        d.line([(x, y), (x + RNG.randint(-2, 2), y - RNG.randint(2, 6))], fill=(t.surface[0], c, t.surface[2]), width=1)


def texture_tile(surf: Image.Image, t: Theme) -> None:
    px = surf.load()
    sw, sh = surf.size
    ts = 32
    for y in range(sh):
        for x in range(sw):
            tx, ty = x // ts, y // ts
            shade = 6 if (tx + ty) % 2 else 0
            n = noise2d(x, y, 0.2) * 8
            r = clamp(t.surface[0] + shade + n)
            g = clamp(t.surface[1] + shade + n)
            b = clamp(t.surface[2] + shade + n)
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(surf)
    for x in range(0, sw, ts):
        d.line([(x, 0), (x, sh)], fill=(80, 88, 96), width=1)
    for y in range(0, sh, ts):
        d.line([(0, y), (sw, y)], fill=(80, 88, 96), width=1)


TEXTURES: dict[str, Callable[[Image.Image, Theme], None]] = {
    "felt": texture_felt,
    "laminate": texture_laminate,
    "wood": texture_wood,
    "wood_dark": texture_wood_dark,
    "concrete": texture_concrete,
    "grass": texture_grass,
    "tile": texture_tile,
}


def draw_pool_pockets(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    r = 28
    pts = [(64, 68), (W - 64, 68), (64, H - 68), (W - 64, H - 68), (W // 2, 56), (W // 2, H - 56)]
    for px, py in pts:
        d.ellipse([px - r - 5, py - r - 5, px + r + 5, py + r + 5], fill=(8, 8, 8))
        d.ellipse([px - r, py - r, px + r, py + r], fill=(0, 0, 0))
        d.ellipse([px - r + 4, py - r + 4, px - r + 14, py - r + 14], fill=(80, 50, 30))


def draw_pool_props(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    colors = [(220, 40, 40), (240, 220, 40), (40, 80, 220), (240, 240, 240), (30, 30, 30)]
    for i, c in enumerate(colors):
        bx, by = 78 + i * 22, 58 + (i % 2) * 8
        d.ellipse([bx - 10, by - 10, bx + 10, by + 10], fill=(0, 0, 0))
        d.ellipse([bx - 9, by - 9, bx + 9, by + 9], fill=c)
        d.ellipse([bx - 4, by - 5, bx - 1, by - 2], fill=(255, 255, 255))
    # Cue sticks
    d.line([(W - 120, 70), (W - 20, 95)], fill=(200, 160, 96), width=6)
    d.line([(W - 115, 78), (W - 18, 102)], fill=(32, 64, 160), width=7)


def draw_kitchen_props(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([68, H - 118, 82, H - 88], radius=4, fill=(240, 240, 240))
    d.rounded_rectangle([88, H - 114, 102, H - 90], radius=4, fill=(48, 48, 48))
    d.rounded_rectangle([W - 112, H - 120, W - 84, H - 98], radius=5, fill=(224, 64, 64))
    d.arc([W - 78, H - 114, W - 62, H - 98], 270, 90, fill=(224, 64, 64), width=3)


def draw_desk_props(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    d.line([(62, 52), (108, 72)], fill=(255, 192, 64), width=4)
    d.line([(108, 72), (116, 78)], fill=(255, 128, 96), width=4)
    d.rounded_rectangle([W - 98, 58, W - 74, 72], radius=3, fill=(255, 128, 144))


def draw_living_props(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([58, H - 100, 94, H - 84], radius=4, fill=(48, 48, 48))
    for i in range(4):
        d.ellipse([66 + i * 7, H - 94, 70 + i * 7, H - 90], fill=(96, 96, 96))
    d.ellipse([W - 78, H - 88, W - 50, H - 60], fill=(139, 96, 64))
    d.ellipse([W - 74, H - 84, W - 54, H - 64], fill=(160, 112, 80))


def draw_lamp(img: Image.Image, lamp: tuple[int, int, int]) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = layer.load()
    cx, cy = W // 2, int(H * 0.42)
    for y in range(H):
        for x in range(W):
            dist = math.hypot(x - cx, y - cy) / (W * 0.55)
            if dist > 1:
                continue
            falloff = (1 - dist) ** 2
            a = int(falloff * 55)
            px[x, y] = (lamp[0], lamp[1], lamp[2], a)
    layer = layer.filter(ImageFilter.GaussianBlur(radius=8))
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))
    # Edge darkening
    vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(vig)
    d.rectangle([0, 0, W, 50], fill=(0, 0, 0, 35))
    d.rectangle([0, H - 70, W, H], fill=(0, 0, 0, 45))
    img.paste(Image.alpha_composite(img.convert("RGBA"), vig).convert("RGB"))


def add_grain(img: Image.Image) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = layer.load()
    for _ in range(W * H // 6):
        x, y = RNG.randint(0, W - 1), RNG.randint(0, H - 1)
        v = RNG.randint(0, 255)
        px[x, y] = (v, v, v, RNG.randint(8, 22))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))


def add_vignette(img: Image.Image) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = layer.load()
    cx, cy = W // 2, H // 2
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx, y - cy) / (W * 0.72)
            if d > 0.65:
                a = int(min(80, (d - 0.65) * 180))
                px[x, y] = (0, 0, 0, a)
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))


def noise2d(x: float, y: float, scale: float) -> float:
    return (
        math.sin(x * scale + y * scale * 0.7)
        + math.sin(x * scale * 1.9 + 2.1)
        + math.sin(y * scale * 2.3 + 1.3)
    ) / 3.0


def lerp3(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        clamp(a[0] + (b[0] - a[0]) * t),
        clamp(a[1] + (b[1] - a[1]) * t),
        clamp(a[2] + (b[2] - a[2]) * t),
    )


def clamp(v: float, lo: int = 0, hi: int = 255) -> int:
    return max(lo, min(hi, int(v)))


if __name__ == "__main__":
    main()
