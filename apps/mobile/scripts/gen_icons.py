#!/usr/bin/env python3
"""
Generator icon launcher Blume (Android).

Membuat master 1024x1024 sesuai warna brand Figma:
- background hijau #A8DB95
- lingkaran tengah pink #F1A4B0 radius 340px
- lingkaran putih #FFFFFF radius 150px di tengah

Lalu resize ke mipmap-{mdpi..xxxhdpi}/ic_launcher.png dan versi round
(di-mask lingkaran penuh) ke ic_launcher_round.png.

Idempotent — aman dijalankan ulang.

Cara pakai:
    python scripts/gen_icons.py

@format
"""

from pathlib import Path

from PIL import Image, ImageDraw

# ── Konfigurasi ──────────────────────────────────────────────────────────────
MASTER_SIZE = 1024
BG_COLOR = "#A8DB95"      # Colors.base (hijau brand)
CIRCLE_COLOR = "#F1A4B0"  # Colors.pink (primary)
CENTER_COLOR = "#FFFFFF"  # putih
CIRCLE_RADIUS = 340
CENTER_RADIUS = 150

# Folder mipmap Android -> ukuran icon (px).
DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

RES_DIR = Path(__file__).resolve().parent.parent / "android/app/src/main/res"


def build_master() -> Image.Image:
    """Buat icon master 1024x1024 (persegi, tanpa mask)."""
    master = Image.new("RGB", (MASTER_SIZE, MASTER_SIZE), BG_COLOR)
    draw = ImageDraw.Draw(master)
    c = MASTER_SIZE // 2

    # Lingkaran pink besar di tengah.
    draw.ellipse(
        [c - CIRCLE_RADIUS, c - CIRCLE_RADIUS, c + CIRCLE_RADIUS, c + CIRCLE_RADIUS],
        fill=CIRCLE_COLOR,
    )
    # Lingkaran putih kecil di tengah.
    draw.ellipse(
        [c - CENTER_RADIUS, c - CENTER_RADIUS, c + CENTER_RADIUS, c + CENTER_RADIUS],
        fill=CENTER_COLOR,
    )
    return master


def round_mask(size: int) -> Image.Image:
    """Mask lingkaran penuh (dengan antialias) untuk versi round icon."""
    scale = 4  # supersampling agar tepi lingkaran halus
    big = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(big)
    draw.ellipse([0, 0, size * scale - 1, size * scale - 1], fill=255)
    return big.resize((size, size), Image.LANCZOS)


def main() -> None:
    master = build_master()

    for density, size in DENSITIES.items():
        out_dir = RES_DIR / f"mipmap-{density}"
        out_dir.mkdir(parents=True, exist_ok=True)

        # Versi reguler: resize langsung.
        icon = master.resize((size, size), Image.LANCZOS)
        icon.save(out_dir / "ic_launcher.png")

        # Versi round: RGBA + mask lingkaran penuh.
        icon_round = icon.convert("RGBA")
        icon_round.putalpha(round_mask(size))
        icon_round.save(out_dir / "ic_launcher_round.png")

        print(f"OK mipmap-{density}: ic_launcher.png + ic_launcher_round.png ({size}px)")

    print("Semua icon launcher selesai dibuat.")


if __name__ == "__main__":
    main()
