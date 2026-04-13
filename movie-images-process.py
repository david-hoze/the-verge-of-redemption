#!/usr/bin/env python3
"""
Resize and center-crop movie stills to 1200x1090.

Usage:
    cd {movie}_raw/
    python3 ../process.py movie_name

Output goes to ../{movie_name}_1200x1090/
"""

import sys
import os
from PIL import Image

TARGET_W, TARGET_H = 1200, 1090
MAX_UPSCALE = 1.10

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <movie_name>")
    sys.exit(1)

MOVIE = sys.argv[1]
SRC = os.path.abspath('.')
OUT = os.path.abspath(f'../{MOVIE}_1200x1090')
os.makedirs(OUT, exist_ok=True)

files = sorted([f for f in os.listdir('.') if f.lower().endswith(('.jpg', '.png'))])
ok, skip = 0, 0

for f in files:
    try:
        img = Image.open(os.path.join(SRC, f))
    except:
        skip += 1
        continue
    if img.mode != 'RGB':
        img = img.convert('RGB')
    w, h = img.size
    scale = TARGET_H / h
    new_w = round(w * scale)
    new_h = TARGET_H
    if scale > MAX_UPSCALE:
        print(f'SKIP {f} ({w}x{h}) needs {scale:.1%} upscale')
        skip += 1
        continue
    img = img.resize((new_w, new_h), Image.LANCZOS)
    if new_w < TARGET_W:
        print(f'SKIP {f} ({w}x{h}) too narrow after scale: {new_w}px')
        skip += 1
        continue
    left = (new_w - TARGET_W) // 2
    img = img.crop((left, 0, left + TARGET_W, TARGET_H))
    idx = str(ok + 1).zfill(2)
    out_name = f'{MOVIE}_{idx}.jpg'
    img.save(os.path.join(OUT, out_name), 'JPEG', quality=95)
    ok += 1

print(f'Done: {ok} processed, {skip} skipped -> {OUT}')
