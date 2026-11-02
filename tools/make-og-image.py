#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build the 1200x630 OG share card for drasta-lp using only on-site wording/brand."""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = r"C:\Users\info\AppData\Local\Temp\claude\C--Users-info-OneDrive-Desktop-HP-------------\6b9bfd0c-c793-4284-b553-f89a21131caa\scratchpad\drasta-lp\drastalp\assets"
OUT = os.path.join(ROOT, "og-image.jpg")

W, H = 1200, 630
PAD = 64

# Brand tokens straight from styles.css
BLUE   = (31, 159, 224)
NAVY   = (14, 92, 158)
LOGOB  = (1, 89, 215)
INK    = (58, 74, 85)
O1     = (255, 176, 46)
O2     = (255, 106, 0)
LINEG  = (0, 185, 0)
WHITE  = (255, 255, 255)

BOLD = r"C:\Windows\Fonts\YuGothB.ttc"
MED  = r"C:\Windows\Fonts\YuGothM.ttc"

def f(path, size):
    return ImageFont.truetype(path, size)

def tw(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


# ---------- background: the site's hero gradient ----------
top    = (234, 246, 253)   # #eaf6fd
mid    = (220, 239, 255)   # #dcefff
bottom = (207, 232, 251)   # #cfe8fb
bg = Image.new("RGB", (W, H), top)
px = bg.load()
for y in range(H):
    t = y / (H - 1)
    if t < 0.55:
        k = t / 0.55
        c = tuple(int(top[i] + (mid[i] - top[i]) * k) for i in range(3))
    else:
        k = (t - 0.55) / 0.45
        c = tuple(int(mid[i] + (bottom[i] - mid[i]) * k) for i in range(3))
    for x in range(W):
        px[x, y] = c

# soft brand orbs (same spirit as .hero-bg .orb, kept very subtle)
orb = Image.new("RGB", (W, H), (0, 0, 0))
od = ImageDraw.Draw(orb)
od.ellipse([880, -170, 1360, 310], fill=BLUE)
od.ellipse([1000, 330, 1340, 670], fill=(108, 194, 74))
od.ellipse([-150, 380, 230, 760], fill=O1)
orb = orb.filter(ImageFilter.GaussianBlur(120))
bg = Image.blend(bg, Image.blend(bg, orb, 1.0), 0.10)

img = bg.convert("RGBA")
ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(ov)

# ---------- logo ----------
logo = Image.open(os.path.join(ROOT, "drasta-logo.png")).convert("RGBA")
LW = 268
LH = round(LW * logo.height / logo.width)
logo = logo.resize((LW, LH), Image.LANCZOS)
ov.alpha_composite(logo, (PAD, 36))
y = 36 + LH + 22                                    # -> ~176

# ---------- faint car silhouette (from the logo mark) to balance the right side ----------
_mark = Image.open(os.path.join(ROOT, "drasta-logo.png")).convert("RGBA")
_mark = _mark.crop((0, 0, _mark.width, int(_mark.height * 0.46)))
_mw = 760
_mark = _mark.resize((_mw, round(_mw * _mark.height / _mark.width)), Image.LANCZOS)
_a = _mark.getchannel("A").point(lambda v: int(v * 0.10))
_mark.putalpha(_a)
ov.alpha_composite(_mark, (W - 470, 84))

# ---------- eyebrow pill (orange gradient, like .badge/.pill on site) ----------
eb_font = f(BOLD, 27)
eb_text = "大阪・奈良｜大学生・これから免許を取る方へ"
etw, _ = tw(d, eb_text, eb_font)
eb_h, eb_w = 54, etw + 56
grad = Image.new("RGBA", (eb_w, eb_h))
gp = grad.load()
for x in range(eb_w):
    k = x / max(1, eb_w - 1)
    gp_c = tuple(int(O1[i] + (O2[i] - O1[i]) * k) for i in range(3)) + (255,)
    for yy in range(eb_h):
        gp[x, yy] = gp_c
mask = Image.new("L", (eb_w, eb_h), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, eb_w - 1, eb_h - 1], radius=eb_h // 2, fill=255)
ov.paste(grad, (PAD, y), mask)
d.text((PAD + 28, y + eb_h // 2), eb_text, font=eb_font, fill=WHITE, anchor="lm")
y += eb_h + 24                                      # -> ~258

# ---------- headline (the site H1) ----------
h_font = f(BOLD, 76)
d.text((PAD, y), "あなたのペースで", font=h_font, fill=INK, anchor="la")
y += 92
l2 = "免許取得"
d.text((PAD, y), l2, font=h_font, fill=NAVY, anchor="la")
l2w, _ = tw(d, l2, h_font)
d.text((PAD + l2w, y + 10), "。", font=f(BOLD, 72), fill=O2, anchor="la")
y += 108                                            # -> ~464

# ---------- feature chips (from the hero chip row) ----------
chip_font = f(BOLD, 26)
chips = ["LINEで予約完結", "分割払いOK", "大和八木駅から無料送迎"]
cx, ch = PAD, 52
for c in chips:
    cwp, _ = tw(d, c, chip_font)
    w = cwp + 44
    d.rounded_rectangle([cx, y, cx + w, y + ch], radius=ch // 2,
                        fill=(255, 255, 255, 235), outline=(211, 235, 248, 255), width=2)
    d.text((cx + w / 2, y + ch / 2), c, font=chip_font, fill=NAVY, anchor="mm")
    cx += w + 14
y += ch + 26                                        # -> ~546

# ---------- price (left) + LINE CTA (right) on one baseline row ----------
p_font = f(BOLD, 42)
s_font = f(MED, 23)
price = "165,000円〜231,000円"
d.text((PAD, y), price, font=p_font, fill=INK, anchor="la")
d.text((PAD + 2, y + 50), "（税込・試験費用別）普通AT免許", font=s_font, fill=(94, 110, 122), anchor="la")

# CTA pill, vertically centred on the price block
blk_top, blk_bot = y, y + 50 + 26
cta_font = f(BOLD, 31)
cta_text = "LINEで無料相談"
ctw, _ = tw(d, cta_text, cta_font)
chip_w, chip_h = 84, 38
pill_h = 74
pill_w = 30 + chip_w + 16 + ctw + 30
pill_x1 = W - PAD
pill_x0 = pill_x1 - pill_w
pill_y0 = int((blk_top + blk_bot) / 2 - pill_h / 2)
d.rounded_rectangle([pill_x0 + 3, pill_y0 + 7, pill_x1 + 3, pill_y0 + pill_h + 7],
                    radius=pill_h // 2, fill=(255, 106, 0, 55))
cg = Image.new("RGBA", (pill_w, pill_h))
cgp = cg.load()
for x in range(pill_w):
    k = x / max(1, pill_w - 1)
    cc = tuple(int(O1[i] + (O2[i] - O1[i]) * k) for i in range(3)) + (255,)
    for yy in range(pill_h):
        cgp[x, yy] = cc
cmask = Image.new("L", (pill_w, pill_h), 0)
ImageDraw.Draw(cmask).rounded_rectangle([0, 0, pill_w - 1, pill_h - 1], radius=pill_h // 2, fill=255)
ov.paste(cg, (pill_x0, pill_y0), cmask)
d.rounded_rectangle([pill_x0 + 30, pill_y0 + (pill_h - chip_h) // 2,
                     pill_x0 + 30 + chip_w, pill_y0 + (pill_h + chip_h) // 2],
                    radius=10, fill=WHITE)
d.text((pill_x0 + 30 + chip_w / 2, pill_y0 + pill_h / 2), "LINE",
       font=f(BOLD, 23), fill=LINEG, anchor="mm")
d.text((pill_x0 + 30 + chip_w + 16, pill_y0 + pill_h / 2), cta_text,
       font=cta_font, fill=WHITE, anchor="lm")

out = Image.alpha_composite(img, ov).convert("RGB")
out.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print("wrote", OUT, out.size, os.path.getsize(OUT) // 1024, "KB")
print("bottom of CTA pill:", pill_y0 + pill_h, "/ canvas", H)
