#!/usr/bin/env python3
"""Process movie stills to 1200x1090. Run from inside the _raw/ directory."""
import sys, os
from PIL import Image

TARGET_W, TARGET_H = 1200, 1090
MAX_UPSCALE = 1.10  # 10% max upscale

name = sys.argv[1] if len(sys.argv) > 1 else "movie"
out_dir = os.path.join("..", f"{name}_1200x1090")
os.makedirs(out_dir, exist_ok=True)

n = 0
for f in sorted(os.listdir(".")):
    if not f.lower().endswith((".jpg", ".jpeg", ".png")):
        continue
    try:
        img = Image.open(f)
    except Exception as e:
        print(f"  SKIP {f}: {e}")
        continue

    if img.mode != "RGB":
        img = img.convert("RGB")

    w, h = img.size
    # Scale to fit height=1090
    scale = TARGET_H / h
    if scale > MAX_UPSCALE:
        print(f"  SKIP {f}: {w}x{h} needs {scale:.1%} upscale (max {MAX_UPSCALE:.0%})")
        continue

    new_w = round(w * scale)
    new_h = TARGET_H
    img = img.resize((new_w, new_h), Image.LANCZOS)

    if new_w < TARGET_W:
        print(f"  SKIP {f}: {new_w}x{new_h} too narrow after scaling")
        continue

    # Center crop width
    left = (new_w - TARGET_W) // 2
    img = img.crop((left, 0, left + TARGET_W, TARGET_H))

    n += 1
    out_name = f"{name}_{n:02d}.jpg"
    img.save(os.path.join(out_dir, out_name), "JPEG", quality=95)
    print(f"  OK {f} -> {out_name}")

print(f"\nProcessed {n} images to {out_dir}/")
