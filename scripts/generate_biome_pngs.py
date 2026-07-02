#!/usr/bin/env python3
"""Premium biome prop PNGs — isometric props, gradients, shadows, neon accents."""
from __future__ import annotations

import math
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "sprites", "biomes")
SIZE = 192
KEY = (6, 10, 20)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    keys = [
        "kitchen_island", "kitchen_fridge", "roof_solar", "roof_ac",
        "garden_tree", "garden_lawn", "garage_charger", "garage_bench",
        "security_camera", "security_laser", "warehouse_shelf", "warehouse_pallet",
        "living_tv", "living_sofa", "balcony_planter", "balcony_sensor",
        "desk_setup", "desk_lamp", "city_towers", "city_lamp",
    ]
    for key in keys:
        img = Image.new("RGBA", (SIZE, SIZE), KEY + (255,))
        draw = ImageDraw.Draw(img)
        draw_prop(img, draw, key)
        path = os.path.join(OUT, f"{key}.png")
        img.save(path, "PNG", optimize=True)
        print(f"wrote {path}")
    print(f"Generated {len(keys)} premium biome sprites @ {SIZE}px.")


def cx() -> float:
    return SIZE * 0.5


def cy() -> float:
    return SIZE * 0.62


def shadow(img: Image.Image, cx_: float, cy_: float, rx: float, ry: float, alpha: int = 70) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx_ - rx, cy_ - ry, cx_ + rx, cy_ + ry], fill=(0, 0, 0, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=3))
    img.alpha_composite(layer)


def glow(img: Image.Image, cx_: float, cy_: float, r: float, color: tuple[int, int, int], alpha: int = 55) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx_ - r, cy_ - r, cx_ + r, cy_ + r], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(2, int(r * 0.35))))
    img.alpha_composite(layer)


def grad_rect(
    img: Image.Image,
    box: tuple[float, float, float, float],
    top: tuple[int, int, int],
    bottom: tuple[int, int, int],
) -> None:
    x0, y0, x1, y1 = box
    w, h = max(1, int(x1 - x0)), max(1, int(y1 - y0))
    g = Image.new("RGBA", (w, h))
    gd = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(1, h - 1)
        col = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        gd.line([(0, y), (w, y)], fill=col + (255,))
    img.alpha_composite(g, (int(x0), int(y0)))


def iso_top(d: ImageDraw.ImageDraw, cx_: float, cy_: float, w: float, d_: float, fill, outline=None) -> None:
    hw, hd = w * 0.5, d_ * 0.5
    pts = [(cx_, cy_ - hd), (cx_ + hw, cy_), (cx_, cy_ + hd), (cx_ - hw, cy_)]
    d.polygon(pts, fill=fill, outline=outline)


def iso_left(d: ImageDraw.ImageDraw, cx_: float, cy_: float, w: float, h: float, d_: float, fill, outline=None) -> None:
    hw, hd = w * 0.5, d_ * 0.5
    pts = [(cx_ - hw, cy_), (cx_, cy_ + hd), (cx_, cy_ + hd + h), (cx_ - hw, cy_ + h)]
    d.polygon(pts, fill=fill, outline=outline)


def iso_right(d: ImageDraw.ImageDraw, cx_: float, cy_: float, w: float, h: float, d_: float, fill, outline=None) -> None:
    hw, hd = w * 0.5, d_ * 0.5
    pts = [(cx_ + hw, cy_), (cx_, cy_ + hd), (cx_, cy_ + hd + h), (cx_ + hw, cy_ + h)]
    d.polygon(pts, fill=fill, outline=outline)


def draw_iso_block(img: Image.Image, d: ImageDraw.ImageDraw, cx_: float, base_y: float, w: float, h: float, d_: float, palette: tuple) -> None:
    top, left, right, edge = palette
    iso_left(d, cx_, base_y - h, w, h, d_, left, edge)
    iso_right(d, cx_, base_y - h, w, h, d_, right, edge)
    iso_top(d, cx_, base_y - h, w, d_, top, edge)


def draw_prop(img: Image.Image, d: ImageDraw.ImageDraw, key: str) -> None:
    c, b = cx(), cy()

    if key == "kitchen_island":
        shadow(img, c, b + 18, 52, 14)
        draw_iso_block(img, d, c, b + 8, 90, 22, 44, ((210, 224, 236), (120, 136, 152), (160, 176, 192), (80, 96, 112)))
        grad_rect(img, (c - 28, b - 18, c + 28, b - 6), (96, 192, 224), (32, 128, 176))
        glow(img, c, b - 12, 18, (64, 192, 255), 40)
        d.rectangle([c - 8, b - 4, c + 8, b + 6], fill=(48, 128, 160))

    elif key == "kitchen_fridge":
        shadow(img, c, b + 20, 22, 10)
        grad_rect(img, (c - 26, b - 52, c + 26, b + 18), (240, 248, 255), (176, 192, 208))
        d.rectangle([c - 26, b - 52, c + 26, b + 18], outline=(96, 128, 160), width=2)
        grad_rect(img, (c - 20, b - 40, c + 20, b - 32), (128, 224, 255), (64, 160, 224))
        grad_rect(img, (c - 20, b + 2, c + 20, b + 10), (128, 224, 255), (64, 160, 224))
        d.ellipse([c - 22, b - 48, c + 22, b - 38], fill=(255, 255, 255, 40))
        glow(img, c, b - 20, 24, (64, 192, 255), 25)

    elif key == "roof_solar":
        shadow(img, c, b + 16, 48, 12)
        for i in range(4):
            x = c - 48 + i * 24
            draw_iso_block(img, d, x + 10, b + 4, 20, 8, 16, ((48, 64, 96), (24, 40, 72), (32, 48, 80), (16, 32, 64)))
            grad_rect(img, (x + 2, b - 22, x + 18, b - 2), (32, 96, 192), (8, 32, 128))
            d.rectangle([x + 2, b - 22, x + 18, b - 2], outline=(128, 192, 255), width=1)
        glow(img, c, b - 10, 30, (64, 160, 255), 30)

    elif key == "roof_ac":
        shadow(img, c, b + 14, 34, 10)
        draw_iso_block(img, d, c, b + 6, 68, 18, 32, ((144, 160, 176), (80, 96, 112), (112, 128, 144), (64, 80, 96)))
        for i in range(6):
            d.rectangle([c - 28 + i * 9, b - 10, c - 22 + i * 9, b + 2], fill=(64, 80, 96))
        d.ellipse([c - 12, b - 32, c + 12, b - 14], fill=(192, 208, 224))
        glow(img, c, b - 22, 14, (160, 200, 255), 35)

    elif key == "garden_tree":
        shadow(img, c, b + 20, 36, 12)
        d.rectangle([c - 8, b - 6, c + 8, b + 22], fill=(96, 56, 32))
        grad_rect(img, (c - 6, b - 4, c + 6, b + 20), (112, 72, 40), (64, 40, 24))
        for ox, oy, r, col in [(-16, -38, 28, (32, 140, 64)), (14, -34, 24, (48, 160, 72)), (0, -48, 32, (24, 120, 56))]:
            d.ellipse([c + ox - r, b + oy - r, c + ox + r, b + oy + r], fill=col)
            d.ellipse([c + ox - r + 8, b + oy - r + 6, c + ox + r - 8, b + oy + r - 6], fill=(64, 192, 96, 80))
        glow(img, c, b - 30, 20, (64, 255, 128), 20)

    elif key == "garden_lawn":
        shadow(img, c, b + 16, 50, 14)
        d.ellipse([c - 52, b - 8, c + 52, b + 24], fill=(24, 96, 40))
        d.ellipse([c - 48, b - 4, c + 48, b + 20], fill=(32, 128, 56))
        for i in range(12):
            a = i / 12 * math.pi * 2
            x = c + math.cos(a) * 30
            y = b + 6 + math.sin(a) * 12
            d.polygon([(x, y - 10), (x - 3, y + 2), (x + 3, y + 2)], fill=(64, 192, 80))
        d.ellipse([c - 48, b - 2, c + 48, b + 18], outline=(80, 200, 100), width=1)

    elif key == "garage_charger":
        shadow(img, c, b + 16, 16, 8)
        draw_iso_block(img, d, c, b + 8, 32, 48, 24, ((72, 72, 88), (40, 40, 56), (56, 56, 72), (32, 32, 48)))
        grad_rect(img, (c - 14, b - 28, c + 14, b - 12), (255, 192, 64), (224, 128, 32))
        glow(img, c, b - 8, 16, (255, 160, 48), 45)
        d.line([c, b - 12, c, b + 14], fill=(96, 255, 144), width=4)
        d.polygon([(c - 6, b - 4), (c, b - 12), (c + 6, b - 4)], fill=(144, 255, 176))

    elif key == "garage_bench":
        shadow(img, c, b + 18, 46, 12)
        draw_iso_block(img, d, c, b + 4, 88, 12, 36, ((128, 140, 156), (72, 84, 100), (96, 108, 124), (56, 68, 84)))
        grad_rect(img, (c - 38, b - 18, c + 38, b - 8), (176, 188, 204), (112, 124, 140))
        d.rectangle([c - 34, b + 4, c - 24, b + 28], fill=(56, 64, 80))
        d.rectangle([c + 24, b + 4, c + 34, b + 28], fill=(56, 64, 80))

    elif key == "security_camera":
        shadow(img, c, b + 14, 28, 10)
        d.rectangle([c - 5, b - 36, c + 5, b - 8], fill=(48, 48, 64))
        d.ellipse([c - 28, b - 26, c + 28, b + 8], fill=(64, 72, 88))
        d.ellipse([c - 22, b - 22, c + 22, b + 4], fill=(96, 104, 120))
        d.ellipse([c + 8, b - 14, c + 20, b - 2], fill=(255, 48, 80))
        glow(img, c + 14, b - 8, 10, (255, 64, 96), 50)
        d.polygon([(c - 20, b - 8), (c + 24, b - 2), (c + 20, b + 6), (c - 16, b)], fill=(48, 56, 72))

    elif key == "security_laser":
        shadow(img, c, b + 12, 34, 10)
        glow(img, c, b, 40, (255, 64, 128), 35)
        d.line([c - 38, b - 26, c + 38, b + 26], fill=(255, 96, 160), width=3)
        d.polygon([(c - 38, b - 26), (c + 38, b + 26), (c + 26, b + 36), (c - 50, b - 16)], fill=(255, 64, 128, 70))
        d.ellipse([c - 44, b - 32, c - 28, b - 16], fill=(255, 64, 128))
        d.ellipse([c + 28, b + 16, c + 44, b + 32], fill=(255, 64, 128))
        glow(img, c - 36, b - 24, 8, (255, 128, 192), 60)
        glow(img, c + 36, b + 24, 8, (255, 128, 192), 60)

    elif key == "warehouse_shelf":
        shadow(img, c, b + 18, 38, 12)
        draw_iso_block(img, d, c, b + 6, 72, 56, 28, ((96, 112, 128), (56, 72, 88), (72, 88, 104), (40, 56, 72)))
        for row in range(3):
            y0 = b - 44 + row * 20
            col = (208, 220, 232) if row % 2 == 0 else (160, 176, 192)
            grad_rect(img, (c - 30, y0, c + 30, y0 + 14), col, tuple(max(0, x - 24) for x in col))
            d.rectangle([c - 30, y0, c + 30, y0 + 14], outline=(48, 64, 80), width=1)

    elif key == "warehouse_pallet":
        shadow(img, c, b + 16, 36, 11)
        for dy, shade in [(8, (112, 80, 48)), (0, (144, 104, 64)), (-10, (176, 128, 80))]:
            draw_iso_block(img, d, c, b + dy, 68, 10, 32, (shade, tuple(max(0, x - 32) for x in shade), tuple(max(0, x - 16) for x in shade), (64, 48, 32)))
        d.line([c - 24, b - 6, c + 24, b - 6], fill=(96, 72, 48), width=2)
        d.line([c - 24, b + 4, c + 24, b + 4], fill=(96, 72, 48), width=2)

    elif key == "living_tv":
        shadow(img, c, b + 16, 38, 11)
        d.rounded_rectangle([c - 38, b - 36, c + 38, b + 10], radius=6, fill=(16, 16, 24), outline=(255, 96, 255), width=2)
        grad_rect(img, (c - 32, b - 30, c + 32, b + 2), (160, 64, 192), (96, 32, 128))
        glow(img, c, b - 14, 28, (255, 64, 255), 35)
        d.rectangle([c - 10, b + 10, c + 10, b + 22], fill=(64, 64, 80))
        d.ellipse([c - 30, b - 32, c - 10, b - 20], fill=(255, 255, 255, 35))

    elif key == "living_sofa":
        shadow(img, c, b + 18, 44, 13)
        draw_iso_block(img, d, c, b + 6, 84, 20, 40, ((128, 80, 176), (80, 48, 128), (104, 64, 152), (56, 32, 104)))
        grad_rect(img, (c - 36, b - 20, c + 36, b - 8), (176, 128, 224), (112, 64, 160))
        d.rounded_rectangle([c - 44, b - 22, c - 28, b + 2], radius=4, fill=(144, 96, 192))
        d.rounded_rectangle([c + 28, b - 22, c + 44, b + 2], radius=4, fill=(144, 96, 192))
        glow(img, c, b - 12, 22, (255, 128, 255), 25)

    elif key == "balcony_planter":
        shadow(img, c, b + 16, 30, 10)
        draw_iso_block(img, d, c, b + 10, 56, 14, 28, ((160, 120, 88), (112, 80, 56), (136, 96, 72), (80, 56, 40)))
        for i in range(5):
            x = c - 20 + i * 10
            d.ellipse([x - 8, b - 20, x + 8, b - 4], fill=(32, 128, 56))
            d.polygon([(x, b - 24), (x - 4, b - 14), (x + 4, b - 14)], fill=(64, 192, 80))
        d.ellipse([c - 6, b - 24, c + 6, b - 14], fill=(255, 96, 128))
        glow(img, c, b - 18, 12, (255, 128, 160), 30)

    elif key == "balcony_sensor":
        shadow(img, c, b + 14, 14, 8)
        d.rectangle([c - 7, b - 28, c + 7, b + 10], fill=(128, 144, 160))
        grad_rect(img, (c - 6, b - 26, c + 6, b + 8), (160, 176, 192), (96, 112, 128))
        d.ellipse([c - 14, b - 46, c + 14, b - 22], fill=(96, 208, 255))
        glow(img, c, b - 34, 20, (64, 192, 255), 45)
        d.arc([c - 22, b - 52, c + 22, b - 18], 200, 340, fill=(160, 240, 255), width=2)

    elif key == "desk_setup":
        shadow(img, c, b + 16, 44, 12)
        draw_iso_block(img, d, c, b + 2, 84, 8, 40, ((64, 72, 88), (32, 40, 56), (48, 56, 72), (24, 32, 48)))
        d.rounded_rectangle([c - 28, b - 38, c + 28, b - 8], radius=4, fill=(16, 24, 32), outline=(64, 80, 104), width=2)
        grad_rect(img, (c - 22, b - 34, c + 22, b - 12), (48, 96, 192), (16, 48, 128))
        glow(img, c, b - 22, 18, (64, 128, 255), 30)
        d.rectangle([c - 5, b + 2, c + 5, b + 20], fill=(80, 88, 104))

    elif key == "desk_lamp":
        shadow(img, c, b + 18, 20, 9)
        d.line([c, b + 18, c, b - 18], fill=(128, 144, 160), width=4)
        d.line([c, b - 18, c + 28, b - 32], fill=(160, 176, 192), width=3)
        d.polygon([(c + 28, b - 32), (c + 48, b - 22), (c + 32, b - 10)], fill=(255, 232, 144))
        grad_rect(img, (c + 30, b - 30, c + 46, b - 14), (255, 248, 208), (255, 208, 96))
        glow(img, c + 38, b - 20, 22, (255, 224, 128), 55)

    elif key == "city_towers":
        shadow(img, c, b + 18, 52, 14)
        for ox, h, w in [(-32, 52, 18), (-2, 64, 22), (28, 56, 18)]:
            x = c + ox
            grad_rect(img, (x - w // 2, b - h, x + w // 2, b + 14), (48, 72, 112), (24, 40, 72))
            d.rectangle([x - w // 2, b - h, x + w // 2, b + 14], outline=(64, 96, 144), width=1)
            for row in range(5):
                for col in range(2):
                    d.rectangle([x - 6 + col * 8, b - h + 8 + row * 10, x - 2 + col * 8, b - h + 14 + row * 10], fill=(255, 216, 80))
        glow(img, c, b - 20, 26, (255, 200, 64), 25)

    elif key == "city_lamp":
        shadow(img, c, b + 18, 16, 8)
        d.rectangle([c - 4, b - 8, c + 4, b + 28], fill=(80, 96, 112))
        grad_rect(img, (c - 4, b - 8, c + 4, b + 28), (112, 128, 144), (64, 80, 96))
        d.ellipse([c - 14, b - 28, c + 14, b - 4], fill=(255, 232, 128))
        glow(img, c, b - 16, 28, (255, 224, 96), 65)
        d.ellipse([c - 12, b - 26, c - 4, b - 18], fill=(255, 255, 255, 50))


if __name__ == "__main__":
    main()
