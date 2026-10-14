"""Generate the PWA icons for the Atithi prototype.
Paper square, ink 'A' set in Poppins if available, one terracotta dot.
Run:  python -I tools/make-icons.py   (from the repo root)
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'prototype', 'icons')
os.makedirs(ROOT, exist_ok=True)
PAPER, INK, ALERT = (248, 246, 241), (30, 29, 26), (180, 87, 60)

def font(size):
    for p in [r'C:\Windows\Fonts\Poppins-Medium.ttf', os.path.expanduser(r'~\AppData\Local\Microsoft\Windows\Fonts\Poppins-Medium.ttf'),
              r'C:\Windows\Fonts\segoeui.ttf', r'C:\Windows\Fonts\arial.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def draw(size, pad_ratio, radius_ratio):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=PAPER)
    f = font(int(size * 0.5))
    text = 'A'
    bbox = d.textbbox((0, 0), text, font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1] - size * 0.02
    d.text((x, y), text, font=f, fill=INK)
    dot = int(size * 0.07)
    cx, cy = int(size * 0.72), int(size * 0.72)
    d.ellipse([cx - dot, cy - dot, cx + dot, cy + dot], fill=ALERT)
    return im

def save(im, name):
    im.save(os.path.join(ROOT, name), 'PNG')
    print('wrote', name)

save(draw(512, 0, 0.22), 'icon-512.png')
save(draw(512, 0, 0.22).resize((192, 192), Image.LANCZOS), 'icon-192.png')
# maskable: full-bleed paper, glyph inside the safe zone
mask = Image.new('RGBA', (512, 512), PAPER + (255,))
inner = draw(360, 0, 0).resize((360, 360), Image.LANCZOS)
mask.alpha_composite(inner, (76, 76))
save(mask, 'icon-maskable-512.png')
# apple touch icon: no transparency, square corners (iOS rounds it)
apple = Image.new('RGB', (180, 180), PAPER)
apple.paste(draw(180, 0, 0).convert('RGB'))
apple.save(os.path.join(ROOT, 'apple-touch-icon.png'), 'PNG'); print('wrote apple-touch-icon.png')

svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f8f6f1"/><text x="32" y="43" text-anchor="middle" font-family="Poppins,system-ui,sans-serif" font-weight="500" font-size="34" fill="#1e1d1a">A</text><circle cx="46" cy="46" r="4.5" fill="#b4573c"/></svg>'''
with open(os.path.join(ROOT, 'favicon.svg'), 'w', encoding='utf-8') as fh:
    fh.write(svg)
print('wrote favicon.svg')
