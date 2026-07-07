"""One-shot: turn the supplied ModHarbor logo into transparent brand assets.

Outputs (transparent, tightly cropped):
  - modharbor-wordmark.png  (wave icon + "ModHarbor" text)
  - modharbor-mark.png      (square, wave icon only)
"""

import sys

import numpy as np
from PIL import Image

SRC = sys.argv[1]
OUT_DIR_APP = "src/renderer/src/assets/brand"
OUT_DIR_WEB = "landing/public/brand"

img = Image.open(SRC).convert("RGB")
arr = np.asarray(img).astype(np.float64)

# Background color from the outer corners of the canvas.
corners = np.concatenate(
    [
        arr[:12, :12].reshape(-1, 3),
        arr[:12, -12:].reshape(-1, 3),
        arr[-12:, :12].reshape(-1, 3),
        arr[-12:, -12:].reshape(-1, 3),
    ]
)
bg = corners.mean(axis=0)
print("background color:", bg.round(1))

dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
LO, HI = 14.0, 70.0
alpha = np.clip((dist - LO) / (HI - LO), 0.0, 1.0)

# Un-blend semi-transparent edge pixels so no navy fringe remains:
# observed = fg*a + bg*(1-a)  =>  fg = (observed - bg*(1-a)) / a
a3 = alpha[..., None]
safe_a = np.where(a3 > 0.02, a3, 1.0)
fg = (arr - bg * (1.0 - a3)) / safe_a
fg = np.clip(fg, 0, 255)

rgba = np.dstack([fg, alpha * 255.0]).astype(np.uint8)
out = Image.fromarray(rgba, "RGBA")

# Tight crop with padding.
mask = alpha > 0.5
rows = np.where(mask.any(axis=1))[0]
cols = np.where(mask.any(axis=0))[0]
PAD = 10
top, bottom = max(rows[0] - PAD, 0), min(rows[-1] + PAD, arr.shape[0] - 1)
left, right = max(cols[0] - PAD, 0), min(cols[-1] + PAD, arr.shape[1] - 1)
wordmark = out.crop((left, top, right + 1, bottom + 1))
print("wordmark size:", wordmark.size)

# Split the icon from the text: first gap of empty columns after content starts.
crop_mask = mask[top : bottom + 1, left : right + 1]
col_filled = crop_mask.any(axis=0)
gap_start = None
run = 0
started = False
for x, filled in enumerate(col_filled):
    if filled:
        if started and run >= 12 and gap_start is not None:
            break
        started = True
        run = 0
        gap_start = None
    elif started:
        if gap_start is None:
            gap_start = x
        run += 1
split_x = gap_start if gap_start is not None else wordmark.size[0]
print("icon split at column:", split_x)

icon = wordmark.crop((0, 0, split_x, wordmark.size[1]))
# Re-crop the icon tightly, then pad to a square.
ia = np.asarray(icon)[..., 3] > 128
ir = np.where(ia.any(axis=1))[0]
ic = np.where(ia.any(axis=0))[0]
icon = icon.crop((ic[0], ir[0], ic[-1] + 1, ir[-1] + 1))
w, h = icon.size
side = max(w, h) + 8
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(icon, ((side - w) // 2, (side - h) // 2))
print("mark size:", square.size)

import os

for out_dir in (OUT_DIR_APP, OUT_DIR_WEB):
    os.makedirs(out_dir, exist_ok=True)
    wordmark.save(os.path.join(out_dir, "modharbor-wordmark.png"))
    square.save(os.path.join(out_dir, "modharbor-mark.png"))
    print("wrote", out_dir)
