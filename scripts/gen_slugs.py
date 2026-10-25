#!/usr/bin/env python3
"""Genera /<slug>/index.html (con vista previa OG) y img/og/<slug>.jpg para cada tienda activa."""
import json, os, re, io, html, hashlib, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageOps
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://market.rivergreensolutions.com/'
RM = open(os.path.join(R, 'assets/js/rm.js'), encoding='utf-8').read()
SB_URL = re.search(r"SB_URL='([^']+)'", RM).group(1)
ANON = os.environ.get('SUPABASE_ANON_KEY') or re.search(r"SB_ANON='([^']+)'", RM).group(1)
RESERVADOS = {'assets','img','capturas','scripts','admin','panel','registro','ingresar','tienda','producto','directorio','privacidad','verificar','index','404','sw','manifest'}
F_B = os.path.join(R, 'scripts/DejaVuSans-Bold.ttf'); F_R = os.path.join(R, 'scripts/DejaVuSans.ttf')

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {'User-Agent': 'RiverMarket'})
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

def abs_url(v):
    if not v: return None
    return v if v.startswith('http') else BASE + v.lstrip('/')

def cargar(v):
    if not v: return None
    try:
        if not v.startswith('http') and os.path.exists(os.path.join(R, v)):
            return Image.open(os.path.join(R, v)).convert('RGBA')
        return Image.open(io.BytesIO(get(abs_url(v)))).convert('RGBA')
    except Exception as e:
        print('  no pude cargar', v, e); return None

def hexrgb(c, d=(30, 79, 168)):
    try:
        c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
    except Exception: return d

def ajustar(draw, txt, fuente, maxw, start):
    s = start
    while s > 30:
        f = ImageFont.truetype(fuente, s)
        if draw.textlength(txt, font=f) <= maxw: return f
        s -= 4
    return ImageFont.truetype(fuente, 30)

def og_imagen(t, dest):
    W, H = 1200, 630
    col = hexrgb(t.get('color') or '')
    im = Image.new('RGB', (W, H), col)
    portada = cargar(t.get('portada'))
    if portada:
        p = ImageOps.fit(portada.convert('RGB'), (W, H))
        im = Image.blend(p, Image.new('RGB', (W, H), (0, 0, 0)), 0.45)
    d = ImageDraw.Draw(im)
    # franja inferior blanca con logo RiverMarket
    d.rectangle([0, H-110, W, H], fill=(255, 255, 255))
    rm = Image.open(os.path.join(R, 'img/logo-rivermarket.png')).convert('RGBA'); rm.thumbnail((360, 80))
    im.paste(rm, (W-rm.width-40, H-55-rm.height//2), rm)
    d.text((40, H-55), 'market.rivergreensolutions.com/' + t['slug'], font=ImageFont.truetype(F_R, 30), fill=(60, 60, 60), anchor='lm')
    # logo de tienda en círculo blanco
    logo = cargar(t.get('logo'))
    cx, cy, rad = 190, 260, 140
    d.ellipse([cx-rad-6, cy-rad-6, cx+rad+6, cy+rad+6], fill=(255, 255, 255))
    if logo:
        l = ImageOps.fit(logo, (2*rad, 2*rad)); m = Image.new('L', (2*rad, 2*rad), 0)
        ImageDraw.Draw(m).ellipse([0, 0, 2*rad, 2*rad], fill=255)
        im.paste(l.convert('RGB'), (cx-rad, cy-rad), m)
    else:
        ini = (t['nombre'] or '?')[:1].upper()
        d.text((cx, cy), ini, font=ImageFont.truetype(F_B, 150), fill=col, anchor='mm')
    nombre = t['nombre'] or t['slug']
    f = ajustar(d, nombre, F_B, 780, 80)
    d.text((380, 230), nombre, font=f, fill=(255, 255, 255), anchor='ls', stroke_width=2, stroke_fill=(0, 0, 0))
    sub = (t.get('rubro') or 'Tienda en RiverMarket')
    d.text((380, 300), sub[:40], font=ImageFont.truetype(F_R, 40), fill=(255, 255, 255), anchor='ls', stroke_width=1, stroke_fill=(0, 0, 0))
    d.rounded_rectangle([380, 340, 780, 400], 30, fill=(250, 204, 21))
    d.text((580, 370), 'Ver catálogo', font=ImageFont.truetype(F_B, 32), fill=(20, 20, 20), anchor='mm')
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=85, optimize=True); data = buf.getvalue()
    if not os.path.exists(dest) or open(dest, 'rb').read() != data:
        open(dest, 'wb').write(data)

def pagina(tpl, t=None):
    """t=None -> plantilla para 404 (slug desde la ruta)."""
    h = tpl.replace('<head>', '<head><base href="/">', 1)
    h = re.sub(r'<meta property="og:image"[^>]*>', '', h)
    h = re.sub(r'<meta property="og:image:(width|height)"[^>]*>', '', h)
    if t is None:
        slug_js = "<script>window.RM_SLUG=(location.pathname.split('/').filter(Boolean)[0]||'').toLowerCase();if(!/^[a-z0-9-]+$/.test(window.RM_SLUG))location.replace('/')</script>"
        meta = f'<meta property="og:image" content="{BASE}img/og-rivermarket.png">'
        return h.replace('<head><base href="/">', '<head><base href="/">' + slug_js + meta, 1)
    nombre = t['nombre'] or t['slug']
    desc = (t.get('descripcion') or '').strip() or f'Catálogo de {nombre}. Haz tu pedido por WhatsApp.'
    url = BASE + t['slug'] + '/'
    v = hashlib.md5(json.dumps([t.get('logo'), t.get('portada'), nombre, t.get('color'), t.get('rubro')]).encode()).hexdigest()[:8]
    img = f'{BASE}img/og/{t["slug"]}.jpg?v={v}'
    e = lambda s: html.escape(s, quote=True)
    meta = (f'<script>window.RM_SLUG={json.dumps(t["slug"])}</script>'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="RiverMarket">'
            f'<meta property="og:title" content="{e(nombre)} · RiverMarket"><meta property="og:description" content="{e(desc[:200])}">'
            f'<meta property="og:url" content="{url}"><link rel="canonical" href="{url}">'
            f'<meta property="og:image" content="{img}"><meta property="og:image:secure_url" content="{img}"><meta property="og:image:type" content="image/jpeg">'
            f'<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(nombre)}">'
            f'<meta name="description" content="{e(desc[:200])}"><meta name="twitter:title" content="{e(nombre)}"><meta name="twitter:image" content="{img}">')
    h = h.replace('<head><base href="/">', '<head><base href="/">' + meta, 1)
    return h.replace('<title>Tienda · RiverMarket</title>', f'<title>{e(nombre)} · RiverMarket</title>')

def escribir(p, s):
    if not os.path.exists(p) or open(p, encoding='utf-8').read() != s:
        open(p, 'w', encoding='utf-8').write(s); print('  actualizado', os.path.relpath(p, R))

def main():
    tpl = open(os.path.join(R, 'tienda.html'), encoding='utf-8').read()
    ts = json.loads(get(f'{SB_URL}/rest/v1/tiendas?select=slug,nombre,descripcion,rubro,logo,portada,color,estado&estado=eq.activa',
                        {'apikey': ANON, 'Authorization': 'Bearer ' + ANON}))
    os.makedirs(os.path.join(R, 'img/og'), exist_ok=True)
    escribir(os.path.join(R, '404.html'), pagina(tpl))
    for t in ts:
        s = (t.get('slug') or '').lower()
        if not re.fullmatch(r'[a-z0-9-]+', s) or s in RESERVADOS: continue
        print('tienda', s)
        os.makedirs(os.path.join(R, s), exist_ok=True)
        og_imagen(t, os.path.join(R, 'img/og', s + '.jpg'))
        escribir(os.path.join(R, s, 'index.html'), pagina(tpl, t))
main()
