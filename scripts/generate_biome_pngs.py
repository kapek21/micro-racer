#!/usr/bin/env python3
"""Generate biome prop PNGs with chroma-key background for asset-loader."""
from __future__ import annotations

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "sprites", "biomes")
SIZE = 128
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
        draw_prop(draw, key, SIZE)
        path = os.path.join(OUT, f"{key}.png")
        img.save(path, "PNG")
        print(f"wrote {path}")
    print(f"Generated {len(keys)} biome sprites.")


def cx(size: int) -> float:
    return size * 0.5


def cy(size: int) -> float:
    return size * 0.58


def draw_prop(d: ImageDraw.ImageDraw, key: str, size: int) -> None:
    c, b = cx(size), cy(size)

    if key == "kitchen_island":
        d.rectangle([c - 38, b - 8, c + 38, b + 20], fill=(136, 152, 168))
        d.rectangle([c - 34, b - 12, c + 34, b - 4], fill=(192, 208, 224))
        d.rectangle([c - 12, b + 2, c + 12, b + 16], fill=(64, 160, 192))
    elif key == "kitchen_fridge":
        d.rectangle([c - 22, b - 40, c + 22, b + 32], fill=(208, 224, 240), outline=(96, 128, 160), width=2)
        d.rectangle([c - 16, b - 28, c + 16, b - 24], fill=(64, 192, 255))
        d.rectangle([c - 16, b + 8, c + 16, b + 12], fill=(64, 192, 255))
    elif key == "roof_solar":
        for i in range(4):
            x = c - 36 + i * 18
            d.rectangle([x, b - 20, x + 16, b + 16], fill=(32, 48, 80))
            d.rectangle([x + 2, b - 18, x + 14, b + 14], fill=(16, 64, 160), outline=(96, 160, 255))
    elif key == "roof_ac":
        d.rectangle([c - 28, b - 16, c + 28, b + 16], fill=(112, 128, 144))
        for i in range(5):
            d.rectangle([c - 24 + i * 10, b - 12, c - 18 + i * 10, b + 12], fill=(80, 96, 112))
        d.ellipse([c - 8, b - 28, c + 8, b - 12], fill=(160, 176, 192))
    elif key == "garden_tree":
        d.rectangle([c - 6, b - 4, c + 6, b + 24], fill=(80, 48, 32))
        d.ellipse([c - 28, b - 52, c + 28, b + 4], fill=(32, 128, 64))
        d.ellipse([c - 22, b - 56, c - 2, b - 28], fill=(48, 160, 80))
        d.ellipse([c + 2, b - 50, c + 22, b - 22], fill=(48, 160, 80))
    elif key == "garden_lawn":
        d.ellipse([c - 40, b - 10, c + 40, b + 26], fill=(32, 128, 48))
        for i in range(8):
            import math
            a = i / 8 * math.pi * 2
            x = c + math.cos(a) * 22
            y = b + math.sin(a) * 10
            d.rectangle([x - 2, y - 6, x + 2, y + 4], fill=(64, 192, 80))
    elif key == "garage_charger":
        d.rectangle([c - 14, b - 30, c + 14, b + 20], fill=(64, 64, 80))
        d.rectangle([c - 10, b - 20, c + 10, b - 8], fill=(255, 160, 48))
        d.line([c, b - 8, c, b + 12], fill=(64, 255, 128), width=3)
    elif key == "garage_bench":
        d.rectangle([c - 36, b - 6, c + 36, b + 6], fill=(96, 104, 120))
        d.rectangle([c - 32, b + 6, c - 24, b + 26], fill=(64, 72, 88))
        d.rectangle([c + 24, b + 6, c + 32, b + 26], fill=(64, 72, 88))
        d.rectangle([c - 28, b - 14, c + 28, b - 6], fill=(128, 144, 160))
    elif key == "security_camera":
        d.rectangle([c - 4, b - 30, c + 4, b - 6], fill=(48, 48, 64))
        d.ellipse([c - 22, b - 22, c + 22, b + 6], fill=(80, 88, 104))
        d.ellipse([c + 10, b - 12, c + 18, b - 4], fill=(255, 32, 64))
    elif key == "security_laser":
        d.line([c - 30, b - 20, c + 30, b + 20], fill=(255, 64, 128), width=2)
        d.ellipse([c - 36, b - 26, c - 24, b - 14], fill=(255, 64, 128))
        d.ellipse([c + 24, b + 14, c + 36, b + 26], fill=(255, 64, 128))
        d.polygon([(c - 30, b - 20), (c + 30, b + 20), (c + 20, b + 30), (c - 40, b - 10)], fill=(255, 64, 128, 90))
    elif key == "warehouse_shelf":
        d.rectangle([c - 30, b - 36, c + 30, b + 20], fill=(80, 96, 112))
        for row in range(3):
            col = (192, 208, 224) if row % 2 == 0 else (160, 176, 192)
            d.rectangle([c - 26, b - 32 + row * 18, c + 26, b - 18 + row * 18], fill=col)
    elif key == "warehouse_pallet":
        d.rectangle([c - 28, b - 8, c + 28, b + 2], fill=(128, 96, 64))
        d.rectangle([c - 28, b + 4, c + 28, b + 14], fill=(128, 96, 64))
        d.rectangle([c - 24, b - 16, c + 24, b - 8], fill=(96, 72, 48))
    elif key == "living_tv":
        d.rectangle([c - 32, b - 28, c + 32, b + 12], fill=(16, 16, 24), outline=(255, 64, 255), width=2)
        d.rectangle([c - 26, b - 22, c + 26, b + 4], fill=(128, 64, 160))
        d.rectangle([c - 8, b + 12, c + 8, b + 22], fill=(64, 64, 80))
    elif key == "living_sofa":
        d.rectangle([c - 36, b - 16, c + 36, b + 12], fill=(96, 64, 160))
        d.rectangle([c - 40, b - 20, c - 28, b + 4], fill=(128, 80, 192))
        d.rectangle([c + 28, b - 20, c + 40, b + 4], fill=(128, 80, 192))
        d.rectangle([c - 30, b - 22, c + 30, b - 14], fill=(144, 112, 208))
    elif key == "balcony_planter":
        d.rectangle([c - 24, b, c + 24, b + 16], fill=(128, 96, 80))
        for i in range(5):
            x = c - 16 + i * 8
            d.ellipse([x - 6, b - 14, x + 6, b - 2], fill=(32, 128, 48))
        d.ellipse([c - 4, b - 18, c + 4, b - 10], fill=(255, 96, 128))
    elif key == "balcony_sensor":
        d.rectangle([c - 6, b - 24, c + 6, b + 8], fill=(128, 144, 160))
        d.ellipse([c - 10, b - 38, c + 10, b - 18], fill=(64, 192, 255))
        d.arc([c - 16, b - 44, c + 16, b - 12], 200, 340, fill=(128, 224, 255))
    elif key == "desk_setup":
        d.rectangle([c - 36, b - 8, c + 36, b], fill=(48, 56, 72))
        d.rectangle([c - 20, b - 32, c + 20, b - 8], fill=(16, 24, 32))
        d.rectangle([c - 16, b - 28, c + 16, b - 10], fill=(32, 64, 160))
        d.rectangle([c - 4, b, c + 4, b + 16], fill=(80, 88, 104))
    elif key == "desk_lamp":
        d.line([c, b + 16, c, b - 16, c + 20, b - 28], fill=(128, 144, 160), width=3)
        d.polygon([(c + 20, b - 28), (c + 36, b - 20), (c + 24, b - 12)], fill=(255, 224, 128))
    elif key == "city_towers":
        d.rectangle([c - 10, b - 40, c + 10, b + 16], fill=(32, 48, 80))
        d.rectangle([c - 28, b - 28, c - 14, b + 16], fill=(32, 48, 80))
        d.rectangle([c + 16, b - 32, c + 30, b + 16], fill=(32, 48, 80))
        for ox in (-28, -10, 16):
            for row in range(4):
                d.rectangle([c + ox + 3, b - 36 + row * 10, c + ox + 7, b - 32 + row * 10], fill=(255, 208, 64))
                d.rectangle([c + ox + 9, b - 36 + row * 10, c + ox + 13, b - 32 + row * 10], fill=(255, 208, 64))
    elif key == "city_lamp":
        d.rectangle([c - 3, b - 8, c + 3, b + 24], fill=(80, 96, 112))
        d.ellipse([c - 10, b - 24, c + 10, b - 4], fill=(255, 224, 96))
        d.ellipse([c - 18, b - 32, c + 18, b + 4], fill=(255, 224, 96, 90))


if __name__ == "__main__":
    main()
